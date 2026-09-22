#!/usr/bin/env python3
"""以 2024_BL_ERP_原始.xlsx 為樣板，合成 2021〜2023 三份「原始三表」假資料，供多年度匯入練習。

三表直接以 2024 檔為樣板改寫資料列，欄位、欄寬、字型、表格樣式、日期／數字格式、條件格式與 2024 檔一致：
  DATA       — 該年度派工單（含前一年底延續單），並整批貼兩次模擬原檔重複列
  完工資料   — DATA 中該年度完工的單，補上人工加值欄位；每台設備第一列填 Work Plan／MTTF／稼動率／妥善率
  未完工資料 — 年底仍未結案的單

所有文字（設備名稱、故障描述、故障原因、完工報告）皆從已去識別化的 2024 檔抽樣；數字、日期、單號全部隨機生成。
random seed 固定 42，可重跑得到一致結果。

跑法：
    uv run --with openpyxl python3 _scripts/synth_history_years.py
"""

import collections
import datetime as dt
import hashlib
import random
from pathlib import Path

import openpyxl

from deidentify_erp import load_extra_terms, verify_terms_zero, verify_no_taho, NAME_MAP_CSV

TAHOHO_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = TAHOHO_DIR / "example" / "erp-raw"
TEMPLATE_XLSX = RAW_DIR / "2024_BL_ERP_原始.xlsx"

SEED = 42
# 每年工單量，對齊 2024 檔 DATA 裡各年度的真實規模（2021: 807、2022: 853、2023: 965）
YEAR_VOLUME = {2021: 810, 2022: 850, 2023: 960}
# 2022 年中單號前綴由 MBL 換成 MBA（2024 檔實況）
PREFIX_SWITCH = dt.date(2022, 7, 1)

ALLOW_DAYS = {
    "緊急": 0, "一天": 1, "二天": 2, "三天": 3, "四天": 4, "五天": 5,
    "一週": 7, "兩週": 14, "三週": 21, "一月": 30,
    "一季": 90, "四個月": 120, "半年": 180, "一年": 365, "大修": 365,
}
PRIORITY_WEIGHTS = {
    "一天": 447, "二天": 295, "一週": 103, "三天": 55, "兩週": 16,
    "緊急": 15, "大修": 13, "一月": 12, "一季": 3, "四天": 2,
}
ANOMALY_WEIGHTS = {
    "功能異常": 854, "預防保養": 90, "機械性異常": 11, "儀控故障": 6,
    "動作異常": 2, "清潔整理": 1, "電氣故障": 1,
}
DISPATCH_LAG_WEIGHTS = {0: 366, 1: 414, 2: 80, 3: 83, 4: 9, 5: 12}
OPEN_STATUS = ["備品申請中", "大修時處理", "維修課檢修中", "待發包中"]
KPI_COLS = ["Work Plan", "MTTF", "稼動率%", "妥善率%"]


def weighted_choice(rng, table):
    keys = list(table)
    return rng.choices(keys, weights=[table[k] for k in keys], k=1)[0]


def load_rows(ws):
    rows = list(ws.iter_rows(values_only=True))
    header = list(rows[0])
    body = [list(r) for r in rows[1:] if r and r[0] is not None]
    return header, body


def fake_equip_code(name):
    digest = hashlib.md5(name.encode("utf-8")).hexdigest().upper()
    return "BA0" + "".join(ch for ch in digest if ch.isalnum())[:13]


class Pools:
    """從 2024 檔抽出各種抽樣池。"""

    def __init__(self, wb):
        h, data = load_rows(wb["DATA"])
        ix = {n: i for i, n in enumerate(h)}
        seen, uniq = set(), []
        for r in data:
            if r[ix["派工單號"]] in seen:
                continue
            seen.add(r[ix["派工單號"]])
            uniq.append(r)
        self.data_header = h
        recent = [r for r in uniq if r[ix["需求日"]].year >= 2022]
        self.equip_weights = collections.Counter(r[ix["設備名稱"]] for r in recent)
        self.desc_by_equip = collections.defaultdict(list)
        for r in recent:
            if r[ix["故障描述"]]:
                self.desc_by_equip[r[ix["設備名稱"]]].append(r[ix["故障描述"]])
        self.desc_all = [r[ix["故障描述"]] for r in recent if r[ix["故障描述"]]]
        self.group_by_equip = {}
        for r in recent:
            self.group_by_equip.setdefault(r[ix["設備名稱"]], r[ix["組別"]])
        self.staff = sorted({r[ix["維修人員"]] for r in recent if r[ix["維修人員"]]})
        # 結單日數分布（2023 已完工單），保留長尾
        self.close_lags = [max(0, int(r[ix["結單日數"]])) for r in uniq
                           if r[ix["需求日"]].year == 2023 and r[ix["完成日"]] is not None]

        wh, done = load_rows(wb["完工資料"])
        wi = {n: i for i, n in enumerate(wh)}
        self.done_header = wh
        self.done_by_equip = collections.defaultdict(list)
        self.done_all = []
        self.equip_code = {}
        self.kpi_by_equip = {}
        for r in done:
            name = r[wi["設備名稱"]]
            self.equip_code[name] = r[wi["設備編號"]]
            rec = {c: r[wi[c]] for c in ["故障原因", "故障代碼", "完工報告", "維修類別", "停機時間(分)", "維修時間(分)"]}
            self.done_by_equip[name].append(rec)
            self.done_all.append(rec)
            if r[wi["MTTF"]] is not None:
                self.kpi_by_equip[name] = {c: r[wi[c]] for c in KPI_COLS}
        self.kpi_all = list(self.kpi_by_equip.values())

        uh, _ = load_rows(wb["未完工資料"])
        self.undone_header = uh


def ticket_ids(rng, year, date, seq):
    prefix = "MBA" if date >= PREFIX_SWITCH else "MBL"
    req_prefix = "LBA" if prefix == "MBA" else "LBL"
    ticket = f"{prefix}{year}{seq:05d}"
    req = f"{req_prefix}{year}{max(1, seq - rng.randint(0, 40)):05d}" if rng.random() < 0.78 else None
    return ticket, req


def synth_year(pools, rng, year):
    as_of = dt.date(year, 12, 31)
    n = YEAR_VOLUME[year]
    n_carry = round(n * 0.03)

    # 需求日：延續單落在前一年 11〜12 月，其餘平均分布於當年，週末量減半
    dates = []
    while len(dates) < n_carry:
        d = dt.date(year - 1, 11, 1) + dt.timedelta(days=rng.randint(0, 60))
        if d.weekday() < 5 or rng.random() < 0.5:
            dates.append(d)
    while len(dates) < n:
        d = dt.date(year, 1, 1) + dt.timedelta(days=rng.randint(0, 364))
        if d.weekday() < 5 or rng.random() < 0.5:
            dates.append(d)
    dates.sort()

    equip_names = list(pools.equip_weights)
    equip_w = [pools.equip_weights[k] for k in equip_names]

    tickets = []
    seq_counter = collections.Counter()
    for req_date in dates:
        y = req_date.year
        seq_counter[y] += 1
        ticket, req_no = ticket_ids(rng, y, req_date, seq_counter[y])
        name = rng.choices(equip_names, weights=equip_w, k=1)[0]
        descs = pools.desc_by_equip.get(name) or pools.desc_all
        priority = weighted_choice(rng, PRIORITY_WEIGHTS)
        dispatch = req_date + dt.timedelta(days=weighted_choice(rng, DISPATCH_LAG_WEIGHTS))
        group = pools.group_by_equip.get(name) or rng.choice(["機械組", "儀電組"])

        # 年底 25 天內的單有一定機率仍未結案，其餘極少數長期未結
        days_left = (as_of - req_date).days
        is_open = (days_left <= 25 and rng.random() < 0.35) or rng.random() < 0.004
        if is_open:
            done = None
            status = None if days_left <= 25 else rng.choice(OPEN_STATUS)
            close_days = round(days_left + rng.random(), 6)
        else:
            lag = rng.choice(pools.close_lags)
            # 三成的單會趕在允許天數內結案，讓逾期率貼近真實資料的約 28%
            if rng.random() < 0.3:
                lag = min(lag, ALLOW_DAYS[priority])
            done = req_date + dt.timedelta(days=lag)
            if done < dispatch:
                done = dispatch
            if done > as_of:
                done = as_of
            status = "已完成"
            close_days = (done - req_date).days
        overdue = "逾期" if close_days > ALLOW_DAYS[priority] else None
        tickets.append({
            "派工單號": ticket, "請修單號": req_no, "設備名稱": name,
            "異常名稱": weighted_choice(rng, ANOMALY_WEIGHTS), "故障描述": rng.choice(descs),
            "組別": group, "維修人員": rng.choice(pools.staff) if status == "已完成" else None,
            "維修狀態": status,
            "需求日": dt.datetime.combine(req_date, dt.time()),
            "派工日": dt.datetime.combine(dispatch, dt.time()),
            "完成日": dt.datetime.combine(done, dt.time()) if done else None,
            "重要順序": priority, "結單日數": close_days, "符合度": overdue,
        })

    # 完工資料：當年度完工的單，補人工加值欄位
    done_rows = []
    for t in sorted(tickets, key=lambda t: (t["設備名稱"], t["完成日"] or dt.datetime.max)):
        if t["完成日"] is None or t["完成日"].year != year:
            continue
        name = t["設備名稱"]
        tmpl = rng.choice(pools.done_by_equip.get(name) or pools.done_all)
        factor = rng.uniform(0.7, 1.3)
        row = {
            "派工單號": t["派工單號"],
            "設備編號": pools.equip_code.get(name) or fake_equip_code(name),
            "設備名稱": name, "故障描述": t["故障描述"],
            "派工日": t["派工日"], "完成日": t["完成日"],
            "故障原因": tmpl["故障原因"], "故障代碼": tmpl["故障代碼"],
            "完工報告": tmpl["完工報告"], "維修類別": tmpl["維修類別"],
            "停機時間(分)": max(10, round(tmpl["停機時間(分)"] * factor / 5) * 5),
            "維修時間(分)": max(10, round(tmpl["維修時間(分)"] * factor / 5) * 5),
            "Work Plan": None, "MTTF": None, "稼動率%": None, "妥善率%": None,
        }
        done_rows.append(row)

    # 每台設備的 KPI 欄位依 Skill 腳本同一套公式計算，填在該設備最後一列：
    #   P = 期間分鐘；MTTF = (P − Σ停機[全部]) ÷ 完工單數；稼動率 = (P − Σ停機[全部]) ÷ P；妥善率 = (P − Σ停機[僅 BD]) ÷ P
    period_min = (dt.date(year, 12, 31) - dt.date(year, 1, 1)).days * 1440 + 1440
    by_eq = collections.defaultdict(list)
    for row in done_rows:
        by_eq[row["設備編號"]].append(row)
    for eq, rows_eq in by_eq.items():
        down = sum(r["停機時間(分)"] for r in rows_eq)
        bd_down = sum(r["停機時間(分)"] for r in rows_eq if r["維修類別"] == "BD")
        last = rows_eq[-1]
        base = pools.kpi_by_equip.get(last["設備名稱"]) or rng.choice(pools.kpi_all)
        last["Work Plan"] = base["Work Plan"]
        last["MTTF"] = round((period_min - down) / len(rows_eq), 2)
        last["稼動率%"] = round((period_min - down) / period_min, 4)
        last["妥善率%"] = round((period_min - bd_down) / period_min, 4)

    undone_rows = [t for t in tickets if t["完成日"] is None]
    undone_rows.sort(key=lambda t: t["需求日"], reverse=True)

    # DATA：依需求日倒序，並把中段整批貼兩次模擬原檔重複列
    data_rows = sorted(tickets, key=lambda t: t["需求日"], reverse=True)
    dup_start = rng.randint(0, len(data_rows) // 3)
    dup_len = round(len(data_rows) * 0.42)
    data_rows = data_rows + data_rows[dup_start:dup_start + dup_len]
    return data_rows, done_rows, undone_rows, len(tickets)


ROW_HEIGHT = {"完工資料": 17.0, "DATA": 20.0}
WRAP_COLS = {"完工資料": {"D", "G", "I"}, "DATA": {"E"}}


def fill_sheet(ws, header, rows):
    """把 2024 樣板工作表的資料列清掉，寫入新資料，並沿用每欄的儲存格樣式、表格樣式、條件格式。"""
    from copy import copy
    from openpyxl.formatting.formatting import ConditionalFormattingList
    from openpyxl.utils import get_column_letter

    ncol = len(header)
    styles = [(copy(c.font), copy(c.alignment), c.number_format, copy(c.border), copy(c.fill))
              for c in ws[2][:ncol]]
    if ws.max_row > 1:
        ws.delete_rows(2, ws.max_row - 1)
    for k in list(ws.row_dimensions):
        if k > 1:
            del ws.row_dimensions[k]

    height = ROW_HEIGHT.get(ws.title)
    wrap_cols = WRAP_COLS.get(ws.title, set())
    for i, r in enumerate(rows, start=2):
        for j, name in enumerate(header):
            cell = ws.cell(row=i, column=j + 1, value=r.get(name))
            font, align, numfmt, border, fill = styles[j]
            cell.font = font
            cell.number_format = numfmt
            cell.border = border
            cell.fill = fill
            if get_column_letter(j + 1) in wrap_cols:
                align = copy(align)
                align.wrap_text = True
            cell.alignment = align
        if height:
            ws.row_dimensions[i].height = height

    last = f"{get_column_letter(ncol)}{len(rows) + 1}"
    for t in ws.tables.values():
        t.ref = f"A1:{last}"
        if t.autoFilter is not None:
            t.autoFilter.ref = f"A1:{last}"
    old_cf = ws.conditional_formatting
    ws.conditional_formatting = ConditionalFormattingList()
    for cf in old_cf:
        col = str(cf.sqref).split(":")[0].rstrip("0123456789")
        for rule in cf.rules:
            ws.conditional_formatting.add(f"{col}2:{col}{len(rows) + 1}", rule)
    ws.freeze_panes = "A2"


def main():
    wb = openpyxl.load_workbook(TEMPLATE_XLSX, data_only=True)
    pools = Pools(wb)
    rng = random.Random(SEED)

    import csv
    names = [r["真名"] for r in csv.DictReader(open(NAME_MAP_CSV, encoding="utf-8-sig"))]
    terms = names + [old for old, _ in load_extra_terms()]

    for year in sorted(YEAR_VOLUME):
        data_rows, done_rows, undone_rows, n_unique = synth_year(pools, rng, year)
        out = openpyxl.load_workbook(TEMPLATE_XLSX)
        fill_sheet(out["完工資料"], pools.done_header, done_rows)
        fill_sheet(out["未完工資料"], pools.undone_header, undone_rows)
        fill_sheet(out["DATA"], pools.data_header, data_rows)
        dest = RAW_DIR / f"{year}_BL_ERP_原始.xlsx"
        out.save(dest)

        repair_h = sum(r["維修時間(分)"] for r in done_rows) / 60
        down_h = sum(r["停機時間(分)"] for r in done_rows) / 60
        overdue = sum(1 for t in data_rows[:n_unique] if t["符合度"])
        print(f"{dest.name}：DATA {len(data_rows)} 列（唯一單號 {n_unique}，重複 {len(data_rows) - n_unique}）"
              f"｜完工 {len(done_rows)} 筆，維修 {repair_h:.1f} h，停機 {down_h:.1f} h"
              f"｜未完工 {len(undone_rows)} 筆｜逾期 {overdue}")
        hits = verify_terms_zero(dest, terms)
        taho = verify_no_taho(dest)
        if hits or taho:
            raise RuntimeError(f"{dest.name} 殘留真名／詞表：{hits}，taho：{taho}")
    print("去識別化詞表殘留檢查：全部為 0")


if __name__ == "__main__":
    main()
