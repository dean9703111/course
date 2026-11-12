
    // ===== 分段初始化防護 =====
    // 每個功能段包在 init(name, fn) 裡：一段丟例外只掉那一段，其餘照常運作；
    // 段內取不到元素就直接 return（不算失敗）。結果記在 window.__coursePage 供測試與除錯。
    // 頂層只放「宣告」：跨段共用的變數（getElementById 不會丟例外）與函式。
    // 被 HTML onclick 引用的 copyPrompt／toggleQA／bonusCopyCode／togglePromptExpand
    // 以及 exportPDF 等函式維持頂層宣告（全域）。
    window.__coursePage = { inited: [], failed: [] };
    function init(name, fn) {
      try { fn(); window.__coursePage.inited.push(name); }
      catch (e) { window.__coursePage.failed.push({ name: name, message: String(e && e.message || e) }); console.warn('[course-page] ' + name + ' 初始化失敗：', e); }
    }

    // localStorage 被封鎖（瀏覽器關掉網站資料、沙盒 iframe）時連讀取 window.localStorage 都會丟例外：
    // 一律走這裡，失敗回 null（set／remove 成功回 true）
    var safeStorage = {
      get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return null; } },
      remove: function (k) { try { window.localStorage.removeItem(k); return true; } catch (e) { return null; } }
    };

    // Reveal on scroll
    init('reveal', function () {
      // ### 卡片級分頁：頁籤坐在面板上緣、邊框相連 —— 分頁列與作用中 pane 的
      // 第一個 reveal 配對（雙向），任一方進入視口就讓兩者同影格 visible，
      // 共用同一組 CSS transition 因此完全同步，避免頁籤與面板進場錯拍的割裂感。
      document.querySelectorAll('.reveal.tab-bar-wrap--card').forEach(function (wrap) {
        var bar = wrap.querySelector('.tab-bar');
        var group = bar && bar.getAttribute('data-tabgroup');
        if (!group) return;
        for (var el = wrap.nextElementSibling; el; el = el.nextElementSibling) {
          if (el.classList && el.classList.contains('tab-pane-el') && el.getAttribute('data-tabgroup') === group) {
            wrap.__revealBuddy = el;
            el.__revealBuddy = wrap;
            break;
          }
        }
      });
      var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('visible');
          if (e.target.__revealBuddy) e.target.__revealBuddy.classList.add('visible');
        });
      }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el) });

      // ### [html] iframe 高度（併在 reveal 段：介面 D 的段名固定）
      // 先把框高設 0、讀 <html> 的 scrollHeight（整份內容含 body margin 與溢出；視窗高 0，
      // 100vh／height:100% 的內容才不會跟著框一直長高）再設回去，同一個 task 內完成不會閃。
      // blocks.mjs 的 inline onload 用同一套量法，兩邊寫入的值一致。簡報模式複製出來的 iframe 由 MutationObserver 接手。
      function fitRawHtml(f) {
        if (f.__rawFit) return;
        f.__rawFit = true;
        var st = f.style;
        var ro = window.ResizeObserver ? new ResizeObserver(sync) : null;
        function sync() {
          try {
            var d = f.contentDocument;
            if (!d || !d.documentElement) return;
            var prev = st.getPropertyValue('height');
            st.setProperty('height', '0px');
            var h = d.documentElement.scrollHeight;
            st.setProperty('height', h ? h + 'px' : prev);
          } catch (e) { }
        }
        function attach() {
          sync();
          try {
            var d = f.contentDocument;
            if (ro && d && d.documentElement) { ro.disconnect(); ro.observe(d.documentElement); }
          } catch (e) { }
        }
        f.addEventListener('load', attach);
        attach();
      }
      document.querySelectorAll('.raw-html-frame').forEach(fitRawHtml);
      new MutationObserver(function (list) {
        list.forEach(function (m) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (n.classList.contains('raw-html-frame')) fitRawHtml(n);
            else n.querySelectorAll('.raw-html-frame').forEach(fitRawHtml);
          });
        });
      }).observe(document.body, { childList: true, subtree: true });
    });

    // Sidebar / Hamburger
    var sidebar = document.getElementById('sidebar');
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('overlay');

    function toggleSidebar() {
      var open = sidebar.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      overlay.classList.toggle('visible', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      hamburger.classList.remove('active');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
    init('sidebar', function () {
      if (!sidebar) return;
      // toggleSidebar／closeSidebar 三個元素都要在
      if (hamburger && overlay) {
        hamburger.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', closeSidebar);
        sidebar.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', function () {
            if (window.innerWidth < 1100) closeSidebar();
          })
        });
      }

      // Desktop sidebar collapse
      var collapseBtn = document.getElementById('sidebar-collapse');
      if (safeStorage.get('sidebar-collapsed') === 'true' && window.innerWidth >= 1100) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
      }
      if (!collapseBtn) return;
      collapseBtn.addEventListener('click', function () {
        var c = sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed', c);
        safeStorage.set('sidebar-collapsed', c);
      });
    });

    // Scroll spy — 這兩個陣列需根據實際內容填入
    var sectionIds = {{ SECTION_IDS }};        // e.g. ['instructor','new-project','old-project','testing','summary']
    var allAnchorIds = {{ ALL_ANCHOR_IDS }};   // e.g. ['instructor','new-project','sub-create-project',...]
    // 兩張對照表由 toc 段填入；updateToc 在任何時機呼叫都讀得到（未填時退回第一個章節）
    var sectionForAnchor = {};
    var subForAnchor = {};

    // ── Branch rail（內容區左側 git graph；absolute 文檔流，隨內容捲動不晃）──
    var branchLineEl = document.getElementById('branch-line');
    var branchTip = document.getElementById('branch-tip');
    var branchSegEls = branchLineEl ? Array.prototype.slice.call(branchLineEl.querySelectorAll('.branch-seg')) : [];
    var branchEnabled = branchSegEls.length > 0;

    // 用 offsetTop 累加求文檔座標（布局位置，不受 reveal 進場動畫 transform 影響 → 任何時機測都一致）
    function branchDocTop(el) {
      var y = 0;
      for (var n = el; n; n = n.offsetParent) y += n.offsetTop;
      return y;
    }

    // 排版每個區段：left=內容框左緣-20，彎出點(top)落在對應 branch-flag 的中線，
    // bottom=下一區段 flag 的中線（彎出相接）／結束標題上方／內容結尾
    function flagFor(anchor) { return document.querySelector('.branch-flag[data-anchor="' + (anchor || '') + '"]'); }
    function flagMid(flag) { return branchDocTop(flag) + flag.getBoundingClientRect().height / 2; }
    function layoutBranchRail() {
      if (!branchEnabled) return;
      var sec = document.querySelector('section.section') || document.querySelector('section.section--header');
      if (!sec) return;
      var contentLeft = sec.getBoundingClientRect().left;
      var lineX = Math.max(0, contentLeft - 20);
      var segWidth = Math.max(8, contentLeft - lineX);
      var footer = document.querySelector('footer.footer');
      var docBottom = footer ? branchDocTop(footer) : document.documentElement.scrollHeight;
      branchSegEls.forEach(function (seg) {
        var tag = flagFor(seg.getAttribute('data-anchor'));
        if (!tag || !tag.getClientRects().length) { seg.style.display = 'none'; return; }
        var top = flagMid(tag); // 彎出點落在 tag 中線（分叉點在 tag 中間）
        var endAttr = seg.getAttribute('data-end');
        var bottom;
        if (endAttr) {
          var endTag = flagFor(endAttr);
          if (endTag) {
            bottom = flagMid(endTag); // 與下一區段彎出點相接
          } else {
            var endEl = document.getElementById(endAttr);
            var endHead = endEl ? (endEl.querySelector('.group-header') || endEl) : null;
            bottom = endHead ? branchDocTop(endHead) - 5 : docBottom - 14; // 結束標題上方收束
          }
        } else {
          bottom = docBottom - 14;
        }
        seg.style.display = '';
        seg.style.left = lineX + 'px';
        seg.style.width = segWidth + 'px';
        seg.style.top = top + 'px';
        seg.style.height = Math.max(20, bottom - top) + 'px';
      });
    }

    init('branch-rail', function () {
      if (branchLineEl && !branchEnabled) branchLineEl.style.display = 'none';
      if (branchEnabled) {
        layoutBranchRail();
        window.addEventListener('resize', layoutBranchRail, { passive: true });
        window.addEventListener('load', layoutBranchRail);
        // 中文字體載入後行高改變會位移下方元素 → 重新排版，確保各層級間距一致
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutBranchRail);
        if (window.ResizeObserver) {
          var branchRO = new ResizeObserver(function () { layoutBranchRail(); });
          branchRO.observe(document.body);
        }
        // hover 於滑鼠處顯示 branch tooltip（線只變粗、不變色）；點擊線可複製分支名稱
        var branchTipLocked = false; // 複製回饋期間鎖住 tooltip，避免 mousemove 立刻蓋掉「✓ 已複製」
        if (branchTip) branchSegEls.forEach(function (seg) {
          var name = seg.getAttribute('data-branch');
          seg.addEventListener('mousemove', function (e) {
            // 滑到 tag 本體時不出 tooltip（只留 tag 自身的選中動態）
            if (e.target.closest && e.target.closest('.branch-flag')) {
              if (!branchTipLocked) branchTip.classList.remove('visible');
              return;
            }
            branchTip.style.left = e.clientX + 'px';
            branchTip.style.top = e.clientY + 'px';
            if (!branchTipLocked) branchTip.textContent = name;
            branchTip.classList.add('visible');
          });
          seg.addEventListener('mouseleave', function () {
            if (!branchTipLocked) branchTip.classList.remove('visible');
          });
          seg.addEventListener('click', function (e) {
            copyToClipboard(name).then(function () {
              branchTipLocked = true;
              branchTip.textContent = '✓ 已複製';
              branchTip.style.left = e.clientX + 'px';
              branchTip.style.top = e.clientY + 'px';
              branchTip.classList.add('visible');
              setTimeout(function () {
                branchTipLocked = false;
                branchTip.classList.remove('visible');
              }, 1000);
            });
          });
        });
      }

      // 點擊側邊 branch tag → 複製分支名稱（含 ✓ 已複製 瞬時回饋；data-branch 為穩定的複製來源）
      Array.prototype.slice.call(document.querySelectorAll('.branch-flag')).forEach(function (flag) {
        function copyBranch() {
          var name = flag.getAttribute('data-branch') || flag.textContent;
          if (flag.classList.contains('copied')) return;
          copyToClipboard(name).then(function () {
            flag.classList.add('copied');
            flag.textContent = '✓ 已複製';
            setTimeout(function () {
              flag.textContent = name;
              flag.classList.remove('copied');
            }, 1200);
          });
        }
        flag.addEventListener('click', copyBranch);
        flag.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyBranch(); }
        });
      });
    });

    // ===== TOOL TABS（[ChatGPT]/[Gemini]/[Claude] 工具分頁）=====
    function activateTabPane(groupId, paneIdx) {
      var idx = String(paneIdx);
      document.querySelectorAll('[data-tabgroup="' + groupId + '"][data-tabpane]').forEach(function (el) {
        var active = el.getAttribute('data-tabpane') === idx;
        el.classList.toggle('tab-pane-active', active);
        if (active) {
          // 切換顯示的內容直接標記 visible，不再等 reveal 進場動畫（隱藏期間 observer 不會觸發）
          if (el.classList.contains('reveal')) el.classList.add('visible');
          el.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        }
      });
      document.querySelectorAll('.tab-btn[data-tabgroup="' + groupId + '"]').forEach(function (btn) {
        var active = btn.getAttribute('data-pane') === idx;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });
      syncHiddenTabSections();
      updateToc();
    }

    // 隱藏「整段內容都落在非作用中 pane」的 section 與其前置分隔線，
    // 避免空 section 的 padding 與孤兒 divider 疊在畫面上。
    function syncHiddenTabSections() {
      document.querySelectorAll('section.section, section.qa-page, section.lab-page, section.interactive-page, section.survey-page').forEach(function (sec) {
        var hidden;
        if (sec.classList.contains('tab-pane-el')) {
          hidden = !sec.classList.contains('tab-pane-active'); // section 本身由 CSS 隱藏
        } else {
          var reveals = Array.prototype.filter.call(sec.children, function (ch) {
            return ch.classList && ch.classList.contains('reveal');
          });
          hidden = reveals.length > 0 && reveals.every(function (ch) {
            return ch.classList.contains('tab-pane-el') && !ch.classList.contains('tab-pane-active');
          });
          sec.style.display = hidden ? 'none' : '';
        }
        var prev = sec.previousElementSibling;
        if (prev && prev.tagName === 'HR' && prev.classList.contains('divider') && !prev.classList.contains('tab-pane-el')) {
          prev.style.display = hidden ? 'none' : '';
        }
      });

      // ##／### 分頁都有可能跨過全版區塊（例如同一組工具各自帶一段 lab）。
      // 此時第二、三個 pane 會被 renderer 放到新的 .section：若只隱藏中間
      // pane，分頁列原 section 的下 padding、下一個 section 的上 padding 與
      // 中間 divider 仍會留下，形成一大段空白。把目前選中的跨 section pane
      // 與分頁列接合，僅在這個狀態移除那些結構性間距。
      document.querySelectorAll('section.section.tab-bar-section--joined, section.section.tab-pane-section--joined').forEach(function (sec) {
        sec.classList.remove('tab-bar-section--joined', 'tab-pane-section--joined');
      });
      document.querySelectorAll('hr.divider.tab-pane-divider--joined').forEach(function (divider) {
        divider.classList.remove('tab-pane-divider--joined');
      });
      document.querySelectorAll('.tab-bar-wrap .tab-bar[data-tabgroup]').forEach(function (bar) {
        var groupId = bar.getAttribute('data-tabgroup');
        var barSection = bar.closest('section.section');
        var activePane = document.querySelector('[data-tabgroup="' + groupId + '"][data-tabpane].tab-pane-active');
        var paneSection = activePane && activePane.closest('section.section');
        if (!barSection || !paneSection || barSection === paneSection) return;

        barSection.classList.add('tab-bar-section--joined');
        paneSection.classList.add('tab-pane-section--joined');
        var divider = paneSection.previousElementSibling;
        if (divider && divider.tagName === 'HR' && divider.classList.contains('divider')) {
          divider.classList.add('tab-pane-divider--joined');
        }
      });
    }

    // 錨點目標在非作用中 pane 內時，先切到該 pane 再捲動
    function revealTabPaneFor(el) {
      var pane = el && el.closest ? el.closest('[data-tabpane]') : null;
      if (!pane || pane.classList.contains('tab-pane-active')) return false;
      activateTabPane(pane.getAttribute('data-tabgroup'), pane.getAttribute('data-tabpane'));
      return true;
    }

    init('tabs', function () {
      document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activateTabPane(btn.getAttribute('data-tabgroup'), btn.getAttribute('data-pane'));
        });
      });
      syncHiddenTabSections();
    });

    var TOC_ACTIVATION_LINE = 50;
    function updateToc() {
      var activeAnchor = allAnchorIds[0];
      allAnchorIds.forEach(function (id) {
        var el = document.getElementById(id);
        // 非作用中 pane 內的錨點（display:none，無 client rect）不參與 scroll-spy
        if (el && el.getClientRects().length && el.getBoundingClientRect().top <= TOC_ACTIVATION_LINE) activeAnchor = id;
      });
      var activeSection = sectionForAnchor[activeAnchor] || sectionIds[0];
      document.querySelectorAll('.toc-group').forEach(function (g) {
        var isActive = g.dataset.section === activeSection;
        g.classList.toggle('expanded', isActive);
        g.querySelector('.toc-group-title').classList.toggle('active', isActive);
      });
      var activeSub = subForAnchor[activeAnchor];
      document.querySelectorAll('.toc-sub a').forEach(function (a) {
        var href = a.getAttribute('href').replace('#', '');
        a.classList.toggle('active', href === activeSub);
      });
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
      // updateToc 也由捲動／分頁切換事件呼叫，進度條元素缺件時跳過而不丟例外
      var progressFill = document.getElementById('progress-fill');
      var progressPct = document.getElementById('progress-pct');
      var collapsedProgressFill = document.getElementById('collapsed-progress-fill');
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressPct) progressPct.textContent = pct + '%';
      if (collapsedProgressFill) collapsedProgressFill.style.width = pct + '%';
    }

    var ticking = false;
    var pendingScroll = false;
    function flushTocFrame() {
      updateToc();
      ticking = false;
      if (pendingScroll) {
        pendingScroll = false;
        ticking = true;
        requestAnimationFrame(flushTocFrame);
      }
    }
    init('toc', function () {
      allAnchorIds.forEach(function (id) {
        if (sectionIds.includes(id)) { sectionForAnchor[id] = id }
        else {
          for (var i = sectionIds.length - 1; i >= 0; i--) {
            var idx = allAnchorIds.indexOf(sectionIds[i]);
            if (idx <= allAnchorIds.indexOf(id)) { sectionForAnchor[id] = sectionIds[i]; break }
          }
        }
      });

      // 出現在 TOC 的 ## 子連結 id（依文件順序）。任一 anchor（含 ###／#### 更深層）→ 其所屬的 ## 子連結，
      // 使捲到 ## 之後的內層標題時，該 ## 子連結持續保持 active，直到下一個 ## 為止。
      var subAnchorIds = Array.prototype.slice.call(document.querySelectorAll('.toc-sub a'))
        .map(function (a) { return a.getAttribute('href').replace('#', ''); });
      allAnchorIds.forEach(function (id) {
        if (sectionIds.includes(id)) return;            // 章節標題本身（##↑ 的 #）不對應任何 ## 子連結
        if (subAnchorIds.includes(id)) { subForAnchor[id] = id; return; }
        var idIdx = allAnchorIds.indexOf(id);
        for (var i = subAnchorIds.length - 1; i >= 0; i--) {
          // 往前找最近、且與自己同屬一個章節的 ## 子連結（避免回填到上一章節的子連結）
          if (allAnchorIds.indexOf(subAnchorIds[i]) <= idIdx &&
              sectionForAnchor[subAnchorIds[i]] === sectionForAnchor[id]) {
            subForAnchor[id] = subAnchorIds[i]; break;
          }
        }
      });

      window.addEventListener('scroll', function () {
        if (ticking) { pendingScroll = true; return; }
        ticking = true;
        requestAnimationFrame(flushTocFrame);
      }, { passive: true });
      window.addEventListener('scrollend', function () { updateToc(); });
      updateToc();
    });

    // Anchor scroll stabilization — images may change layout after initial jump.
    var hashScrollTimer = null;
    var hashScrollSession = 0;
    var suppressHashScrollFix = false;
    var anchorFocusTimer = null;

    function prefersReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function getHashTarget(hash) {
      if (!hash || hash === '#') return null;
      var id = hash.charAt(0) === '#' ? hash.slice(1) : hash;
      var el = document.getElementById(id);
      if (!el) {
        try { el = document.getElementById(decodeURIComponent(id)); } catch (e) { }
      }
      return el;
    }

    function getHashTargetTop(el) {
      return Math.max(0, el.getBoundingClientRect().top + window.scrollY - 20);
    }

    function getAnchorScrollBehavior(el) {
      if (prefersReducedMotion()) return 'auto';
      var targetTop = getHashTargetTop(el);
      var distance = Math.abs(targetTop - window.scrollY);
      return distance > window.innerHeight * 2.5 ? 'auto' : 'smooth';
    }

    function focusHashTarget(hash, delay) {
      clearTimeout(anchorFocusTimer);
      anchorFocusTimer = setTimeout(function () {
        var el = getHashTarget(hash);
        if (!el) return;
        document.querySelectorAll('.anchor-focus').forEach(function (target) {
          target.classList.remove('anchor-focus');
        });
        void el.offsetWidth;
        el.classList.add('anchor-focus');
        setTimeout(function () { el.classList.remove('anchor-focus'); }, prefersReducedMotion() ? 600 : 950);
      }, delay || 0);
    }

    function scrollToHashTarget(hash, behavior) {
      var el = getHashTarget(hash);
      if (!el) return 'auto';
      var chosenBehavior = behavior || getAnchorScrollBehavior(el);
      window.scrollTo({ top: getHashTargetTop(el), behavior: chosenBehavior });
      return chosenBehavior;
    }
    function cancelHashScrollFix() {
      suppressHashScrollFix = true;
      hashScrollSession++;
      clearTimeout(hashScrollTimer);
    }
    function scheduleHashScrollFix(delay, behavior, sessionId) {
      if (!window.location.hash) return;
      if (suppressHashScrollFix) return;
      var currentSession = sessionId || hashScrollSession;
      clearTimeout(hashScrollTimer);
      hashScrollTimer = setTimeout(function () {
        if (suppressHashScrollFix || currentSession !== hashScrollSession) return;
        scrollToHashTarget(window.location.hash, behavior || 'auto');
        updateToc();
      }, delay || 0);
    }

    init('hash-nav', function () {
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var hash = a.getAttribute('href');
          if (!hash || hash === '#') return;
          var id = hash.slice(1);
          var targetEl = document.getElementById(id);
          if (!targetEl) return;
          e.preventDefault();
          suppressHashScrollFix = false;
          hashScrollSession++;
          var sessionId = hashScrollSession;
          if (window.location.hash !== hash) history.pushState(null, '', hash);
          revealTabPaneFor(targetEl); // 目標在非作用中分頁時先切換，捲動位置才會正確
          var behavior = scrollToHashTarget(hash);
          focusHashTarget(hash, behavior === 'smooth' ? 320 : 80);
          scheduleHashScrollFix(220, 'auto', sessionId);
          scheduleHashScrollFix(900, 'auto', sessionId);
        });
      });

      window.addEventListener('hashchange', function () {
        suppressHashScrollFix = false;
        hashScrollSession++;
        var sessionId = hashScrollSession;
        revealTabPaneFor(getHashTarget(window.location.hash));
        scheduleHashScrollFix(0, 'auto', sessionId);
        scheduleHashScrollFix(220, 'auto', sessionId);
        scheduleHashScrollFix(900, 'auto', sessionId);
        focusHashTarget(window.location.hash, 120);
      });

      Array.from(document.images).forEach(function (img) {
        if (img.complete) return;
        img.addEventListener('load', function () { scheduleHashScrollFix(0, 'auto', hashScrollSession); }, { passive: true });
        img.addEventListener('error', function () { scheduleHashScrollFix(0, 'auto', hashScrollSession); }, { passive: true });
      });

      window.addEventListener('load', function () {
        revealTabPaneFor(getHashTarget(window.location.hash));
        scheduleHashScrollFix(0, 'auto', hashScrollSession);
        scheduleHashScrollFix(300, 'auto', hashScrollSession);
      });

      ['wheel', 'touchstart', 'pointerdown'].forEach(function (evt) {
        window.addEventListener(evt, function () { cancelHashScrollFix(); }, { passive: true });
      });
    });

    // Theme toggle（palette 段也會用到 themeToggle）
    var themeToggle = document.getElementById('theme-toggle');
    init('theme', function () {
      if (!themeToggle) return;
      themeToggle.addEventListener('click', function () {
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
          document.documentElement.removeAttribute('data-theme');
          safeStorage.set('theme', 'dark');
          themeToggle.textContent = '🌙';
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          safeStorage.set('theme', 'light');
          themeToggle.textContent = '☀️';
        }
      });
      window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function (e) {
        if (safeStorage.get('theme')) return;
        if (e.matches) { document.documentElement.removeAttribute('data-theme'); themeToggle.textContent = '🌙' }
        else { document.documentElement.setAttribute('data-theme', 'light'); themeToggle.textContent = '☀️' }
      });
    });

    // 取標題純文字（排除工具分頁 chip，避免「標題Claude」這種串接）；PDF 匯出與簡報模式共用
    function headingText(el) {
      if (!el) return '';
      var clone = el.cloneNode(true);
      clone.querySelectorAll('.tab-pane-tag').forEach(function (t) { t.remove(); });
      return clone.textContent.trim();
    }

    // 取標題內工具分頁 chip 的 HTML（無則空字串）；PDF slide header 與簡報 breadcrumb 用它補回 chip
    function headingTabTag(el) {
      var t = el ? el.querySelector('.tab-pane-tag') : null;
      return t ? t.outerHTML : '';
    }

    // Shared markdown helpers (used by bonus modal and PDF export)
    function fmtInline(s) {
      return s
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    function renderMd(text) {
      var lines = text.split('\n');
      var html = '';
      var paraLines = [];
      var inList = false;
      var inSteps = false;
      var inCode = false;
      var codeLines = [];
      function flushPara() {
        if (paraLines.length) { html += '<p>' + paraLines.map(fmtInline).join('<br>') + '</p>'; paraLines = []; }
      }
      function flushList() { if (inList) { html += '</ul>'; inList = false; } }
      function flushSteps() { if (inSteps) { html += '</div>'; inSteps = false; } }
      function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (/^```/.test(l)) {
          if (!inCode) {
            flushPara(); flushList(); flushSteps();
            inCode = true; codeLines = [];
          } else {
            var copySvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
            html += '<div class="bonus-code-block"><button class="bonus-code-copy" onclick="bonusCopyCode(this)" title="複製">' + copySvg + '</button><pre><code>' + escHtml(codeLines.join('\n')) + '</code></pre></div>';
            inCode = false;
          }
          continue;
        }
        if (inCode) { codeLines.push(l); continue; }
        var stepMatch = l.match(/^(\d+)\.\s+(.*)/);
        if (stepMatch) {
          flushPara(); flushList();
          if (!inSteps) { html += '<div class="bonus-steps">'; inSteps = true; }
          html += '<div class="bonus-step"><span class="bonus-step-num">' + stepMatch[1] + '</span><span class="bonus-step-text">' + fmtInline(stepMatch[2]) + '</span></div>';
        } else if (/^- /.test(l)) {
          flushPara(); flushSteps();
          if (!inList) { html += '<ul>'; inList = true; }
          html += '<li>' + fmtInline(l.replace(/^- /, '')) + '</li>';
        } else if (/^---$/.test(l.trim())) {
          flushSteps(); flushList(); flushPara();
          html += '<hr>';
        } else if (l.trim() === '') {
          flushSteps(); flushList(); flushPara();
        } else {
          flushSteps(); flushList(); paraLines.push(l);
        }
      }
      if (inCode) html += '<pre><code>' + escHtml(codeLines.join('\n')) + '</code></pre>';
      flushSteps(); flushList(); flushPara();
      return html;
    }

    // Bonus Modal（[bonus] 與 [feedback] 共用同一個彈窗；外層只做宣告，綁定分成 bonus／feedback 兩段）
    (function () {
      var overlay = document.getElementById('bonus-overlay');
      var closeBtn = document.getElementById('bonus-modal-close');
      var titleEl = document.getElementById('bonus-modal-title');
      var bodyEl = document.getElementById('bonus-modal-body');
      var modalReady = !!(overlay && titleEl && bodyEl);

      function openModal(title, content) {
        titleEl.textContent = title;
        bodyEl.innerHTML = renderMd(content);
        overlay.classList.remove('is-feedback');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }
      function closeModal() {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
      }

      // [feedback] 回饋儀表板：內容已於 build 時渲染進 <template>，開啟時複製進同一個 modal（加寬版）
      function openFeedback(btn) {
        var tpl = btn.parentElement && btn.parentElement.querySelector('template.feedback-tpl');
        if (!tpl) return;
        titleEl.textContent = btn.dataset.feedbackTitle || '';
        bodyEl.innerHTML = tpl.innerHTML;
        bodyEl.scrollTop = 0;
        overlay.classList.add('visible', 'is-feedback');
        document.body.style.overflow = 'hidden';
      }

      // 「前往段落」：依標題文字（忽略空白與 emoji）找到章節／小節／卡片，捲過去並高亮
      function normHeading(s) {
        return (s || '').replace(/\p{Extended_Pictographic}/gu, '').replace(/[\s‍️]/g, '');
      }
      function findHeading(target) {
        var key = normHeading(target);
        if (!key) return null;
        var nodes = document.querySelectorAll('.sub-title, .group-header, .section-label, section.section h2');
        var partial = null;
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].closest('#pres-deck, #print-slides')) continue;
          var t = normHeading(nodes[i].textContent);
          if (t === key) return nodes[i];
          if (!partial && t.indexOf(key) !== -1) partial = nodes[i];
        }
        return partial;
      }
      function jumpToHeading(target) {
        var el = findHeading(target);
        if (!el || document.body.classList.contains('pres-active')) return;
        var flashEl = el.closest('.group-block') || el;
        revealTabPaneFor(el);
        cancelHashScrollFix();
        // 長距離跳轉沿用錨點的策略：直接跳（不 smooth），再分段校正圖片／reveal 造成的版面位移
        var behavior = getAnchorScrollBehavior(flashEl);
        var userMoved = false;
        var markMoved = function () { userMoved = true; };
        ['wheel', 'touchstart', 'keydown'].forEach(function (evt) { window.addEventListener(evt, markMoved, { once: true, passive: true }); });
        var targetTop = function () { return Math.max(0, getHashTargetTop(flashEl) - 40); };
        window.scrollTo({ top: targetTop(), behavior: behavior });
        (behavior === 'auto' ? [120, 400, 800] : [900]).forEach(function (d) {
          setTimeout(function () {
            if (!userMoved && Math.abs(targetTop() - window.scrollY) > 4) window.scrollTo({ top: targetTop(), behavior: 'auto' });
          }, d);
        });
        flashEl.classList.remove('fb-flash');
        setTimeout(function () {
          void flashEl.offsetWidth;
          flashEl.classList.add('fb-flash');
          setTimeout(function () { flashEl.classList.remove('fb-flash'); }, 2600);
        }, prefersReducedMotion() ? 0 : 450);
      }

      init('bonus', function () {
        if (!modalReady) return;
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
        document.addEventListener('keydown', function (e) {
          if (e.key !== 'Escape' || !overlay.classList.contains('visible')) return;
          closeModal();
          e.stopImmediatePropagation(); // 簡報模式下 Esc 只關彈窗，不連帶退出簡報
        });

        document.querySelectorAll('.bonus-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            openModal(btn.dataset.bonusTitle || '', btn.dataset.bonusContent || '');
          });
        });
      });

      init('feedback', function () {
        if (!modalReady) return;
        // 事件委派：簡報模式複製出來的回饋按鈕也能開啟
        document.addEventListener('click', function (e) {
          var fbBtn = e.target.closest && e.target.closest('.feedback-btn');
          if (fbBtn) { openFeedback(fbBtn); return; }
          var jump = e.target.closest && e.target.closest('.fb-jump');
          if (jump && bodyEl.contains(jump)) {
            closeModal();
            jumpToHeading(jump.dataset.target || '');
          }
        });
      });
    })();

    // Copy prompt
    function toggleQA(btn) {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      var answer = btn.nextElementSibling;
      if (!expanded) {
        answer.classList.add('open');
      } else {
        answer.classList.remove('open');
      }
    }
    // [qa-session] 的展開由 HTML onclick="toggleQA(this)" 直接呼叫上面的全域函式，載入時無須綁定
    init('qa', function () { });

    // 複製到剪貼簿；file:// 等非安全環境下 navigator.clipboard 不存在，退回 execCommand。
    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.top = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          ok ? resolve() : reject(new Error('execCommand copy failed'));
        } catch (e) { reject(e); }
      });
    }

    function bonusCopyCode(btn) {
      var text = btn.closest('.bonus-code-block').querySelector('code').textContent;
      copyToClipboard(text).then(function () {
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.style.opacity = '1';
        setTimeout(function () {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
          btn.style.opacity = '';
        }, 1500);
      });
    }

    function copyPrompt(btn) {
      var text = btn.closest('.prompt-block').querySelector('.prompt-body').textContent;
      copyToClipboard(text).then(function () {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        btn.style.opacity = '1';
        setTimeout(function () {
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
          btn.style.opacity = '';
        }, 1500);
      });
    }

    // Font size toggle (5 levels)
    var fontSizes = [16, 21, 22, 23, 24];
    var fontLabels = ['A1', 'A2', 'A3', 'A4', 'A5'];
    var fontIdx = 2; // font-size 段依 localStorage 校正；exportPDF 也會讀
    var fontBtn = document.getElementById('fontsize-toggle');
    function applyFontSize() {
      document.documentElement.style.fontSize = fontSizes[fontIdx] + 'px';
      fontBtn.textContent = fontLabels[fontIdx];
      safeStorage.set('fontSize', fontSizes[fontIdx]);
    }
    init('font-size', function () {
      fontIdx = fontSizes.indexOf(parseInt(safeStorage.get('fontSize')) || 18);
      if (fontIdx < 0) fontIdx = 2;
      if (!fontBtn) return;
      applyFontSize();
      fontBtn.addEventListener('click', function () {
        fontIdx = (fontIdx + 1) % fontSizes.length;
        applyFontSize();
      });
    });

    // ===== SETTINGS PANEL =====（外層只做宣告；settings／palette／pdf 三段共用 closeSettings）
    (function () {
      var settingsToggle = document.getElementById('settings-toggle');
      var settingsPanel = document.getElementById('settings-panel');

      function openSettings() {
        var rect = settingsToggle.getBoundingClientRect();
        settingsPanel.style.top = (rect.bottom + 8) + 'px';
        // 面板高度以視窗剩餘空間為上限（放不下就內部捲動）；寬度依 CSS 實際值，緊湊版會加寬
        settingsPanel.style.maxHeight = (window.innerHeight - rect.bottom - 16) + 'px';
        settingsPanel.style.left = Math.min(rect.left, window.innerWidth - settingsPanel.offsetWidth - 8) + 'px';
        settingsPanel.classList.add('open');
        settingsToggle.classList.add('active');
      }
      function closeSettings() {
        if (!settingsPanel || !settingsToggle) return; // pdf 段在設定面板缺件時也會呼叫
        settingsPanel.classList.remove('open');
        settingsToggle.classList.remove('active');
      }

      init('settings', function () {
        // ===== PRESENTATION BUTTON TOGGLE =====（不依賴面板開關，先處理）
        var presBtnToggle = document.getElementById('pres-btn-toggle');
        if (presBtnToggle) {
          var presBtnHidden = safeStorage.get('presBtnHidden') === '1';
          presBtnToggle.checked = !presBtnHidden;
          document.documentElement.toggleAttribute('data-hide-pres-btn', presBtnHidden);
          presBtnToggle.addEventListener('change', function () {
            var hidden = !presBtnToggle.checked;
            document.documentElement.toggleAttribute('data-hide-pres-btn', hidden);
            safeStorage.set('presBtnHidden', hidden ? '1' : '0');
          });
        }

        // ===== 講師工具（休息計時、QRCode、WiFi）=====：預設收合，?teach=1／?present=1 預設展開；
        // 只記使用者自己點 summary 的結果（網址參數展開的不寫回，學員下次開一般網址仍是收合）
        var teacherTools = document.getElementById('teacher-tools');
        var teacherSummary = teacherTools && teacherTools.querySelector('summary');
        if (teacherTools && teacherSummary) {
          teacherTools.open = /[?&]teach=1(?:&|$)/.test(location.search) || /[?&]present(?:=|&|$)/.test(location.search)
            || safeStorage.get('teacherToolsOpen') === '1';
          teacherSummary.addEventListener('click', function () {
            safeStorage.set('teacherToolsOpen', teacherTools.open ? '0' : '1'); // click 先於展開／收合
          });
        }

        if (!settingsToggle || !settingsPanel) return;
        settingsToggle.addEventListener('click', function (e) {
          e.stopPropagation();
          settingsPanel.classList.contains('open') ? closeSettings() : openSettings();
        });

        settingsPanel.addEventListener('click', function (e) { e.stopPropagation(); });

        document.addEventListener('click', closeSettings);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSettings(); });
      });

      // ===== COLOR THEMES =====
      init('palette', function () {
        function hexToRgbStr(hex) {
          var r = parseInt(hex.slice(1, 3), 16);
          var g = parseInt(hex.slice(3, 5), 16);
          var b = parseInt(hex.slice(5, 7), 16);
          return r + ' ' + g + ' ' + b;
        }

        function applyPalette(data, isLight) {
          var root = document.documentElement;
          var suffix = isLight ? 'Light' : '';
          var a = isLight ? (data.accentLight || data.accent) : data.accent;
          var a2 = isLight ? (data.accent2Light || data.accent2) : data.accent2;
          var a3 = isLight ? (data.accent3Light || data.accent3) : data.accent3;
          root.style.setProperty('--accent', a);
          root.style.setProperty('--accent-rgb', hexToRgbStr(a));
          root.style.setProperty('--accent2', a2);
          root.style.setProperty('--accent2-rgb', hexToRgbStr(a2));
          root.style.setProperty('--accent3', a3);
          root.style.setProperty('--accent3-rgb', hexToRgbStr(a3));
        }

        function getSwatchData(sw) {
          return {
            accent: sw.dataset.accent,
            accentLight: sw.dataset.accentLight,
            accent2: sw.dataset.accent2,
            accent2Light: sw.dataset.accent2Light,
            accent3: sw.dataset.accent3,
            accent3Light: sw.dataset.accent3Light
          };
        }

        function updateSwatchSelection(activeId) {
          document.querySelectorAll('.color-swatch').forEach(function (sw) {
            sw.classList.toggle('selected', sw.dataset.themeId === activeId);
          });
        }

        // Restore saved palette on load
        var savedPalette = safeStorage.get('colorPalette');
        if (savedPalette) {
          try {
            var sp = JSON.parse(savedPalette);
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            applyPalette(sp, isLight);
            document.querySelectorAll('.color-swatch').forEach(function (sw) {
              if (sw.dataset.accent === sp.accent) sw.classList.add('selected');
            });
          } catch (e) { }
        } else {
          var firstSwatch = document.querySelector('.color-swatch[data-theme-id="coral"]');
          if (firstSwatch) firstSwatch.classList.add('selected');
        }

        document.querySelectorAll('.color-swatch').forEach(function (sw) {
          sw.addEventListener('click', function () {
            var data = getSwatchData(sw);
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            applyPalette(data, isLight);
            safeStorage.set('colorPalette', JSON.stringify(data));
            updateSwatchSelection(sw.dataset.themeId);
          });
        });

        // Re-apply palette when theme (dark/light) is toggled
        if (themeToggle) themeToggle.addEventListener('click', function () {
          var paletteData = safeStorage.get('colorPalette');
          if (!paletteData) return;
          try {
            var pd = JSON.parse(paletteData);
            setTimeout(function () {
              var isLight = document.documentElement.getAttribute('data-theme') === 'light';
              applyPalette(pd, isLight);
            }, 0);
          } catch (e) { }
        });
      });

      // ===== PDF EXPORT =====
      init('pdf', function () {
        // ?print=1：載入完成（含字型）即跑 packer，#print-slides 留在畫面上、不開列印對話框
        //（供 export-pdf.mjs 的 page.pdf() 與視覺檢查截圖；完成時 window.__coursePage.printReady = true）
        if (/[?&]print=1(?:&|$)/.test(location.search)) {
          window.addEventListener('load', function () {
            var run = function () {
              try { exportPDF({ preview: true }); }
              catch (e) { window.__coursePage.failed.push({ name: 'pdf', message: String(e && e.message || e) }); console.warn('[course-page] ?print=1 失敗：', e); }
            };
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else run();
          });
        }
        var exportBtn = document.getElementById('export-pdf-btn');
        if (!exportBtn) return;
        exportBtn.addEventListener('click', function () {
          closeSettings();
          exportPDF();
        });
      });
    })();

    // ===== BREAK TIMER =====
    init('break-timer', function () {
      var overlay = document.getElementById('break-overlay');
      var closeBtn = document.getElementById('break-modal-close');
      var modal = overlay && overlay.querySelector('.break-modal');
      var modalIcon = document.getElementById('break-modal-icon');
      var introText = document.getElementById('break-intro-text');
      var minutesInput = document.getElementById('break-minutes');
      var startBtn = document.getElementById('break-start-btn');
      var setupDiv = document.getElementById('break-setup');
      var countdownDiv = document.getElementById('break-countdown');
      var countdownTime = document.getElementById('break-countdown-time');
      var doneMessage = document.getElementById('break-done-message');
      var endBtn = document.getElementById('break-end-btn');
      var timerBtn = document.getElementById('break-timer-btn');
      var timer = null;
      // 休息彈窗是一組完整元件：缺任何一件就整段不綁
      if (!overlay || !closeBtn || !modal || !modalIcon || !introText || !minutesInput || !startBtn
        || !setupDiv || !countdownDiv || !countdownTime || !doneMessage || !endBtn || !timerBtn) return;

      function resetBreakState() {
        setupDiv.style.display = '';
        countdownDiv.classList.remove('active', 'done');
        modal.classList.remove('done');
        introText.classList.remove('hidden');
        doneMessage.style.display = '';
        modalIcon.textContent = '☕';
        endBtn.textContent = '結束休息';
      }

      timerBtn.addEventListener('click', function () {
        var settingsPanel = document.getElementById('settings-panel');
        settingsPanel.classList.remove('open');
        document.getElementById('settings-toggle').classList.remove('active');
        resetBreakState();
        overlay.classList.add('open');
        minutesInput.focus();
      });

      function closeBreak() {
        overlay.classList.remove('open');
        if (timer) { clearInterval(timer); timer = null; }
        resetBreakState();
      }

      closeBtn.addEventListener('click', closeBreak);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeBreak();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('open')) closeBreak();
      });

      startBtn.addEventListener('click', function () {
        var mins = parseInt(minutesInput.value) || 10;
        if (mins < 1) mins = 1;
        if (mins > 120) mins = 120;
        var remaining = mins * 60;

        setupDiv.style.display = 'none';
        countdownDiv.classList.add('active');
        introText.classList.add('hidden');

        function update() {
          var m = Math.floor(remaining / 60);
          var s = remaining % 60;
          countdownTime.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        }
        update();

        timer = setInterval(function () {
          remaining--;
          if (remaining <= 0) {
            clearInterval(timer);
            timer = null;
            countdownTime.textContent = '00:00';
            countdownDiv.classList.add('done');
            modal.classList.add('done');
            modalIcon.textContent = '⏰';
            endBtn.textContent = '回到課程';
            return;
          }
          update();
        }, 1000);
      });

      endBtn.addEventListener('click', closeBreak);
    });

    // opts.preview（?print=1）：packer 跑完不呼叫 window.print()、#print-slides 留在 DOM，
    // 並把 @media print 規則套到螢幕上，畫面即 PDF 版面
    function exportPDF(opts) {
      var printPreview = !!(opts && opts.preview);
      var sections = document.querySelectorAll('section.section:not(.section--header)');
      if (!sections.length) {
        if (printPreview) { window.__coursePage.printReady = true; return; } // 無頭瀏覽器不能卡在 alert
        alert('找不到課程章節，請確認頁面已正常載入。'); return;
      }

      var printSlides = document.createElement('div');
      printSlides.id = 'print-slides';
      // Off-screen for height measurement
      printSlides.style.cssText = 'position:fixed;left:-9999px;width:1280px;display:block;visibility:hidden;';
      document.body.appendChild(printSlides);

      // Hero title page
      var heroEl = document.querySelector('header.hero');
      if (heroEl) {
        var heroSlide = document.createElement('div');
        heroSlide.className = 'slide slide-hero';
        heroSlide.appendChild(heroEl.cloneNode(true));
        printSlides.appendChild(heroSlide);
      }

      // Helper: build a quote/QA/lab/survey slide from its source page element
      function buildQuoteSlide(qp) {
        var isQA = qp.classList.contains('qa-page');
        var isLab = qp.classList.contains('lab-page');
        var isSurvey = qp.classList.contains('survey-page');
        var isInteractive = qp.classList.contains('interactive-page');
        var qSlide = document.createElement('div');
        qSlide.className = 'slide slide-quote' + (isQA ? ' slide-qa' : '') + (isLab ? ' slide-lab' : '') + (isSurvey ? ' slide-survey' : '') + (isInteractive ? ' slide-interactive' : '');
        var clone = qp.cloneNode(true);
        clone.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        if (isQA) {
          clone.querySelectorAll('.qa-question').forEach(function (btn) {
            btn.setAttribute('aria-expanded', 'true');
            btn.removeAttribute('onclick');
          });
          clone.querySelectorAll('.qa-answer').forEach(function (answer) {
            answer.classList.add('open');
          });
        }
        qSlide.appendChild(clone);
        return qSlide;
      }

      // Walk all top-level slide-bearing nodes in document order so lab/qa/survey
      // pages are emitted at their actual position (mid-document, not all at end).
      var orderedNodes = document.querySelectorAll('section.section:not(.section--header), section.quote-page, section.qa-page, section.lab-page, section.interactive-page, section.survey-page');

      // Track the previous chapter's title so continuation sections (those split
      // off by an inline lab/qa/survey) inherit the right header instead of going blank.
      var pdfPrevMainTitle = '';
      orderedNodes.forEach(function (section) {
        if (!section.classList.contains('section')) {
          printSlides.appendChild(buildQuoteSlide(section));
          return;
        }
        var h2El = section.querySelector('h2');
        var mainTitle = h2El ? h2El.textContent.trim() : pdfPrevMainTitle;
        if (h2El) pdfPrevMainTitle = mainTitle;

        var leadClone = null;
        var contentChildren = [];
        section.childNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.classList.contains('reveal') && node.querySelector('.section-label')) {
            var lead = node.querySelector('.lead');
            if (lead) leadClone = lead.cloneNode(true);
            return;
          }
          contentChildren.push(node);
        });

        // Separate [bonus] blocks from normal content — bonus gets standalone slides
        var bonusChildren = [];
        var normalChildren = [];
        contentChildren.forEach(function (child) {
          if (child.querySelector && child.querySelector(':scope > .bonus-btn, :scope > .feedback-wrap')) {
            bonusChildren.push(child);
          } else {
            normalChildren.push(child);
          }
        });

        // Split normal content by ## sub-sections; ### (card) stays within the same page.
        // YouTube embeds become dedicated print slides so PDFs get one video per page.
        var entries = [];
        var currentPage = [];
        var activeSubTitle = '';
        var activeSubTag = '';
        function flushCurrentPage() {
          if (!currentPage.length) return;
          entries.push({ type: 'page', subTitle: activeSubTitle, subTag: activeSubTag, children: currentPage });
          currentPage = [];
        }
        normalChildren.forEach(function (child) {
          // 工具分頁的分頁列在列印時不輸出（各 pane 內容全數展開、以 chip 標示）
          if (child.querySelector && child.querySelector(':scope > .tab-bar')) return;
          var isSub = child.querySelector && child.querySelector(':scope > .sub-title');
          var isYoutube = child.querySelector && child.querySelector(':scope > .youtube-embed');
          if (isSub && currentPage.length > 0) {
            // Flush the previous ## block before switching subtitle context,
            // otherwise intro paragraphs get mislabeled as the next subsection.
            flushCurrentPage();
          }
          if (isSub) {
            var subEl = child.querySelector(':scope > .sub-title');
            activeSubTitle = subEl ? headingText(subEl) : activeSubTitle;
            if (subEl) activeSubTag = headingTabTag(subEl); // 每個 ## 重設（無 chip 則清空）
          }
          if (isYoutube) {
            flushCurrentPage();
            entries.push({ type: 'youtube', subTitle: activeSubTitle, subTag: activeSubTag, child: child });
            return;
          }
          currentPage.push(child);
        });
        flushCurrentPage();

        // Section title page — always render (except instructor); lead is optional
        var labelEl = section.querySelector('.section-label');
        if (labelEl && labelEl.id !== 'instructor') {
          var sectionLabel = labelEl ? labelEl.textContent.trim() : '';
          var titleSlide = document.createElement('div');
          titleSlide.className = 'slide slide-section-title';
          titleSlide.innerHTML =
            '<div class="section-title-inner">' +
            (sectionLabel ? '<div class="section-title-num">' + sectionLabel + '</div>' : '') +
            '<h2 class="section-title-heading">' + mainTitle + '</h2>' +
            (leadClone ? '<div class="section-title-lead">' + leadClone.innerHTML + '</div>' : '') +
            '</div>';
          printSlides.appendChild(titleSlide);
        }

        entries.forEach(function (entry) {
          if (entry.type === 'page') {
            var slide = makeSlide(mainTitle, entry.subTitle, 0, entry.subTag);
            var body = slide.querySelector('.slide-body');
            entry.children.forEach(function (child) {
              var clone = child.cloneNode(true);
              // ## sub-title is shown in the header, remove it from body to avoid duplication
              var subTitleInBody = clone.querySelector(':scope > .sub-title');
              if (subTitleInBody) {
                subTitleInBody.remove();
                // Skip empty clones (sub-title was the only content in this reveal)
                if (!clone.hasChildNodes() || clone.textContent.trim() === '') return;
              }
              if (clone.classList.contains('reveal')) clone.classList.add('visible');
              clone.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
              body.appendChild(clone);
            });
            printSlides.appendChild(slide);
            return;
          }

          var embed = entry.child.querySelector(':scope > .youtube-embed');
          var wrapper = embed ? embed.querySelector('.youtube-wrapper') : null;
          var captionEl = embed ? embed.querySelector('.youtube-caption') : null;
          var videoId = wrapper ? wrapper.getAttribute('data-id') : '';
          var videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
          var videoTitle = captionEl ? captionEl.textContent.trim() : 'YouTube 影片';
          var youtubeSlide = makeSlide(videoTitle, '', 0, entry.subTag);
          youtubeSlide.classList.add('slide-youtube');
          var youtubeBody = youtubeSlide.querySelector('.slide-body');
          var link = document.createElement('a');
          link.className = 'youtube-print-link';
          link.href = videoUrl;
          link.target = '_blank';
          link.rel = 'noopener';

          var url = document.createElement('div');
          url.className = 'youtube-print-link-url';
          url.textContent = videoUrl;
          link.appendChild(url);

          var hint = document.createElement('div');
          hint.className = 'youtube-print-link-hint';
          hint.textContent = '可點擊此頁面直接開啟影片';
          link.appendChild(hint);

          youtubeBody.appendChild(link);
          printSlides.appendChild(youtubeSlide);
        });

        // Bonus blocks → standalone headerless slides
        bonusChildren.forEach(function (child) {
          var slide = document.createElement('div');
          slide.className = 'slide slide-bonus';
          var body = document.createElement('div');
          body.className = 'slide-body';
          child.querySelectorAll('.bonus-btn').forEach(function (btn) {
            var card = document.createElement('div');
            card.className = 'card';
            var h3 = document.createElement('h3');
            h3.textContent = btn.dataset.bonusTitle || '';
            card.appendChild(h3);
            var inner = document.createElement('div');
            inner.innerHTML = renderMd(btn.dataset.bonusContent || '');
            card.appendChild(inner);
            body.appendChild(card);
          });
          if (body.children.length) {
            slide.appendChild(body);
            printSlides.appendChild(slide);
          }
          // [feedback] 回饋儀表板 → 每個面板一頁，避免整份儀表板塞進單頁被裁切
          child.querySelectorAll('.feedback-wrap').forEach(function (wrap) {
            var btn = wrap.querySelector('.feedback-btn');
            var tpl = wrap.querySelector('template.feedback-tpl');
            if (!tpl) return;
            var holder = document.createElement('div');
            holder.innerHTML = tpl.innerHTML;
            var desc = holder.querySelector('.fb-desc');
            holder.querySelectorAll('.fb-panel').forEach(function (panel, idx) {
              var fbSlide = document.createElement('div');
              fbSlide.className = 'slide slide-bonus';
              var fbBody = document.createElement('div');
              fbBody.className = 'slide-body';
              var card = document.createElement('div');
              card.className = 'card fb';
              var h3 = document.createElement('h3');
              h3.textContent = btn ? (btn.dataset.feedbackTitle || '') : '';
              card.appendChild(h3);
              if (idx === 0 && desc) card.appendChild(desc.cloneNode(true));
              card.appendChild(panel);
              fbBody.appendChild(card);
              fbSlide.appendChild(fbBody);
              printSlides.appendChild(fbSlide);
            });
          });
        });
      });

      // Footer → "Thank You" closing slide
      var footerEl = document.querySelector('footer.footer');
      if (footerEl) {
        var footerSlide = document.createElement('div');
        footerSlide.className = 'slide slide-footer';

        var inner = document.createElement('div');
        inner.className = 'footer-inner';

        // Thank you title
        var thanks = document.createElement('div');
        thanks.className = 'footer-thanks';
        thanks.textContent = 'Thank You';
        inner.appendChild(thanks);

        // Accent line
        var line = document.createElement('div');
        line.className = 'footer-line';
        inner.appendChild(line);

        // CTA text (from original footer)
        var ctaSrc = footerEl.querySelector('p[style*="font-size"]');
        if (ctaSrc) {
          var cta = document.createElement('div');
          cta.className = 'footer-cta';
          cta.textContent = ctaSrc.textContent.trim();
          inner.appendChild(cta);
        }

        // Social links (clone from original footer, re-wrap)
        var socialsSrc = footerEl.querySelector('.social-links');
        if (socialsSrc) {
          var socials = socialsSrc.cloneNode(true);
          socials.className = 'footer-socials';
          socials.removeAttribute('style');
          inner.appendChild(socials);
        }

        // Copyright
        var copySrc = footerEl.querySelectorAll('p');
        var copyText = '';
        copySrc.forEach(function (p) {
          if (!p.getAttribute('style')) copyText = p.textContent.trim();
        });
        if (copyText) {
          var copy = document.createElement('div');
          copy.className = 'footer-copyright';
          copy.textContent = copyText;
          inner.appendChild(copy);
        }

        footerSlide.appendChild(inner);
        printSlides.appendChild(footerSlide);
      }

      // Inline raw-html-frame iframes for print — iframe srcdoc does not render
      // in the PDF pipeline, so replace each frame with its content in place.
      // Scope the embedded <style> to the holder so bare tag selectors
      // (table/th/td…) don't leak into the rest of the document.
      printSlides.querySelectorAll('.raw-html-frame').forEach(function (iframe) {
        var holder = document.createElement('div');
        holder.className = 'raw-html-print';
        holder.innerHTML = iframe.getAttribute('srcdoc') || '';
        holder.querySelectorAll('style').forEach(function (st) {
          st.textContent = st.textContent.replace(/([^{}]+)\{/g, function (m, sel) {
            if (sel.indexOf('@') !== -1) return m;
            return sel.split(',').map(function (s) {
              s = s.trim();
              return s ? '.raw-html-print ' + s : s;
            }).join(',') + '{';
          });
        });
        iframe.parentNode.replaceChild(holder, iframe);
      });

      // Strip loading="lazy" — lazy images have 0 height off-screen,
      // which makes all slide measurements wrong.
      Array.from(printSlides.querySelectorAll('img[loading]')).forEach(function (img) {
        img.removeAttribute('loading');
      });

      // Wait for ALL images to load before measuring slides.
      // Most are cached from the live page; uncached ones need a real load.
      var allImgs = Array.from(printSlides.querySelectorAll('img'));
      var unloaded = allImgs.filter(function (i) { return !i.complete; });

      function runPackerAndPrint() {
        // Force layout before measuring
        // Scale print font-size proportionally from the user's A1–A5 selection (1.5× web size)
        var PRINT_SCALE = 1.2;
        var webFontSize = fontSizes[fontIdx] || 16;
        var printFontSize = webFontSize * PRINT_SCALE;
        var origFontSize = document.documentElement.style.fontSize;
        document.documentElement.style.fontSize = printFontSize + 'px';
        void printSlides.offsetHeight;

        // ── Greedy slide packer ──
        // Add children one by one; when adding one causes overflow, start a new
        // slide. If a single child alone overflows (e.g. a big image), shrink it
        // to fit. Consecutive images naturally get separate slides.
        var MAX_H = 720;

        // Fit instructor slide: compact layout, then size avatar to fill remaining space.
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          var inst = s.querySelector('.instructor');
          if (!inst) return;
          var av = s.querySelector('.instructor-avatar, .instructor-avatar-placeholder');

          // Compact the instructor box for print — web CSS has 2rem padding/margin
          inst.style.padding = '1rem';
          inst.style.margin = '0';
          inst.style.gap = '1.5rem';
          inst.style.alignItems = 'center';
          inst.style.border = 'none';
          inst.style.background = 'none';

          if (!av) return;
          // Start large and shrink avatar only until slide fits 720px
          var size = 300;
          var minSize = 80;
          av.style.width = size + 'px';
          av.style.height = size + 'px';
          av.style.flexShrink = '0';
          void s.offsetHeight;
          while (s.scrollHeight > MAX_H && size > minSize) {
            size -= 8;
            av.style.width = size + 'px';
            av.style.height = size + 'px';
            void s.offsetHeight;
          }
        });

        function shrinkImagesInSlide(slide) {
          var imgs = Array.from(slide.querySelectorAll('img'));
          imgs.forEach(function (img) {
            var attempts = 0;
            while (attempts < 14 && slide.scrollHeight > MAX_H) {
              var curH = img.offsetHeight;
              if (curH < 180) break;
              var nextH = Math.max(180, curH * 0.9);
              var ratio = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : (img.offsetWidth / Math.max(1, img.offsetHeight));
              var box = img.closest('.content-image, .image-text__img, .content-table') || img.parentElement;
              var maxW = box ? box.clientWidth : img.offsetWidth;
              if (img.closest('.content-table')) maxW = Math.min(420, maxW);
              var nextW = Math.min(maxW, nextH * ratio);
              nextH = nextW / ratio;
              img.style.width = nextW + 'px';
              img.style.height = nextH + 'px';
              img.style.maxWidth = maxW + 'px';
              img.style.maxHeight = nextH + 'px';
              img.style.objectFit = 'contain';
              void slide.offsetHeight;
              attempts++;
            }
          });
        }

        function fitImagesToAvailableSpace(slide) {
          Array.from(slide.querySelectorAll('.content-image img, .image-text__img img, .content-table img.inline-image')).forEach(function (img) {
            var isTableImage = !!img.closest('.content-table');
            img.style.removeProperty('width');
            img.style.removeProperty('height');
            img.style.removeProperty('max-height');
            img.style.maxWidth = isTableImage ? '420px' : '100%';
            img.style.objectFit = 'contain';
            void slide.offsetHeight;

            var slideRect = slide.getBoundingClientRect();
            var imgRect = img.getBoundingClientRect();
            var figure = img.closest('.content-image');
            var caption = figure ? figure.querySelector('figcaption') : null;
            var captionH = caption ? caption.getBoundingClientRect().height + 8 : 0;
            var top = imgRect.top - slideRect.top;
            var available = Math.max(180, MAX_H - top - captionH - 18);
            var box = img.closest('.content-image, .image-text__img, .content-table') || img.parentElement;
            var maxW = box ? box.clientWidth : slideRect.width;
            if (isTableImage) maxW = Math.min(420, maxW);
            var cap = isTableImage ? 420 : (img.closest('.image-text') ? 500 : 620);
            var ratio = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : (img.offsetWidth / Math.max(1, img.offsetHeight));
            var targetH = Math.min(cap, available);
            var targetW = Math.min(maxW, targetH * ratio);
            targetH = targetW / ratio;
            if (targetW <= 0 || targetH <= 0) return;
            img.style.width = targetW + 'px';
            img.style.height = targetH + 'px';
            img.style.maxWidth = maxW + 'px';
            img.style.maxHeight = targetH + 'px';
            img.style.objectFit = 'contain';
            void slide.offsetHeight;
          });
        }

        function shrinkFlowsInSlide(slide) {
          var flows = Array.from(slide.querySelectorAll('.flow'));
          var attempts = 0;
          while (attempts < 16 && slide.scrollHeight > MAX_H && flows.length) {
            flows.sort(function (a, b) {
              return b.getBoundingClientRect().height - a.getBoundingClientRect().height;
            });
            var flow = flows.find(function (f) {
              return (parseFloat(f.style.zoom) || 1) > 0.58;
            });
            if (!flow) break;
            var curZoom = parseFloat(flow.style.zoom) || 1;
            flow.style.zoom = Math.max(0.58, curZoom * 0.92).toFixed(4);
            void slide.offsetHeight;
            attempts++;
          }
        }

        function fitImagesInAllSlides() {
          Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
            if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote')
              || s.classList.contains('slide-footer') || s.classList.contains('slide-section-title')) return;
            if (!s.querySelector('.content-image img, .image-text__img img, .content-table img.inline-image')) return;
            fitImagesToAvailableSpace(s);
            if (s.scrollHeight > MAX_H) {
              shrinkFlowsInSlide(s);
              if (s.scrollHeight > MAX_H) shrinkFontInSlide(s);
              if (s.scrollHeight > MAX_H) shrinkImagesInSlide(s);
            }
          });
        }

        function shrinkFontInSlide(slide) {
          var body = slide.querySelector('.slide-body') || slide;
          var attempts = 0;
          while (slide.scrollHeight > MAX_H && attempts < 8) {
            var before = slide.scrollHeight;
            var prev = body.style.fontSize;
            var cur = parseFloat(getComputedStyle(body).fontSize);
            var ratio = (MAX_H - 4) / slide.scrollHeight;
            body.style.fontSize = (cur * ratio) + 'px';
            void slide.offsetHeight;
            // 元件字級幾乎都用 rem（相對 <html>），改這裡常常毫無作用；沒變矮就還原並停手，否則連縮 8 次、
            // 多次呼叫下來會把繼承字級的文字（[html] 列印內容、未設字級的段落）縮到 0px。剩下的交給 zoomBodyToFit
            if (slide.scrollHeight >= before) { body.style.fontSize = prev; break; }
            attempts++;
          }
        }

        // 最後手段：整個 .slide-body 用 zoom 等比縮（zoom 連 rem 尺寸一起縮，同 shrinkSlideToFit），下限 .6。
        // 只在拆頁之後呼叫（見下方「拆不開的單一區塊」與 Final flow pass）：放進 fitOverflowInSlide 會在
        // 拆 group-block 之前就把整張卡縮小，該拆成多頁的內容被擠在一頁。
        // 要不要縮看子元素框的下緣有沒有超出頁面，不看 scrollHeight：最後一塊的 margin-bottom 會讓
        // scrollHeight 多出 10–70px，內容框其實放得下的頁不該被縮。決定縮了，就二分找 scrollHeight ≤ 720 的
        // 最大 zoom（和其他步驟同一標準，後面的 prompt-body 縮字才不會再動它；zoom 會改變換行，
        // 例如相簿兩列變一列，按比例估算常常縮過頭）
        function zoomBodyToFit(slide) {
          var body = slide.querySelector('.slide-body');
          if (!body || !body.children.length) return;
          var b = body.getBoundingClientRect().top;
          Array.prototype.forEach.call(body.children, function (c) { b = Math.max(b, c.getBoundingClientRect().bottom); });
          if (b <= slide.getBoundingClientRect().top + MAX_H + 1) return;
          function fitsAt(z) {
            body.style.zoom = z.toFixed(4);
            void slide.offsetHeight;
            return slide.scrollHeight <= MAX_H;
          }
          var hi = parseFloat(body.style.zoom) || 1;
          var lo = 0.6;
          if (!fitsAt(lo)) return; // 縮到下限仍放不下：停在下限
          for (var i = 0; i < 7; i++) {
            var mid = (lo + hi) / 2;
            if (fitsAt(mid)) lo = mid; else hi = mid;
          }
          fitsAt(lo);
        }

        function fitOverflowInSlide(slide) {
          shrinkFlowsInSlide(slide);
          if (slide.scrollHeight > MAX_H) shrinkFontInSlide(slide);
          fitImagesToAvailableSpace(slide);
          if (slide.scrollHeight > MAX_H) shrinkImagesInSlide(slide);
          if (slide.scrollHeight > MAX_H) shrinkFontInSlide(slide);
        }

        function renumberSlideSubtitles() {
          var byBase = {};
          Array.from(printSlides.querySelectorAll('.slide')).forEach(function (sl) {
            var st = sl.querySelector(':scope > .slide-header > .slide-subtitle');
            if (!st) return;
            var base = st.dataset.base || st.textContent.replace(/\s+\(\d+(?:\/\d+)?\)$/, '');
            if (!base) return;
            st.dataset.base = base;
            if (!byBase[base]) byBase[base] = [];
            byBase[base].push(st);
          });
          Object.keys(byBase).forEach(function (base) {
            var sts = byBase[base];
            if (sts.length <= 1) {
              sts[0].textContent = base;
            } else {
              sts.forEach(function (st, i) {
                st.textContent = base + ' (' + (i + 1) + '/' + sts.length + ')';
              });
            }
          });
        }

        function isMinorTitleReveal(node) {
          return !!(node && node.querySelector && node.querySelector(':scope > .minor-title'));
        }

        function isMinorTitleNode(node) {
          return !!(node && node.matches && node.matches('.minor-title'));
        }

        Array.from(printSlides.children).forEach(function (origSlide) {
          if (origSlide.classList.contains('slide-hero') || origSlide.classList.contains('slide-quote')
            || origSlide.classList.contains('slide-footer') || origSlide.classList.contains('slide-bonus')
            || origSlide.classList.contains('slide-section-title')) return;
          if (origSlide.querySelector('.instructor')) return;

          var body = origSlide.querySelector('.slide-body');
          if (!body || body.children.length <= 1) {
            // Single-child slide that overflows → shrink to fit
            void origSlide.offsetHeight;
            if (origSlide.scrollHeight > MAX_H) {
              fitOverflowInSlide(origSlide);
            }
            return;
          }

          void origSlide.offsetHeight;
          if (origSlide.scrollHeight <= MAX_H) return;

          var header = origSlide.querySelector('.slide-header');
          var mainTitle = header ? (header.querySelector('.slide-title') || {}).textContent || '' : '';
          var stEl = header ? header.querySelector('.slide-subtitle') : null;
          var subBase = stEl ? (stEl.dataset.base || stEl.textContent) : '';
          var subTag = header ? headingTabTag(header) : ''; // 續頁 header 沿用工具分頁 chip

          var allChildren = Array.from(body.children);
          while (body.firstChild) body.removeChild(body.firstChild);

          var curSlide = origSlide;
          var curBody = body;
          var group = [curSlide];

          for (var ci = 0; ci < allChildren.length; ci++) {
            var child = allChildren[ci];
            curBody.appendChild(child);
            void curSlide.offsetHeight;

            // If a #### title fits alone but its following content would not,
            // start the next slide at the #### instead of orphaning it at the bottom.
            if (isMinorTitleReveal(child) && allChildren[ci + 1] && curBody.children.length > 1) {
              var nextChild = allChildren[ci + 1];
              curBody.appendChild(nextChild);
              void curSlide.offsetHeight;
              if (curSlide.scrollHeight > MAX_H) {
                curBody.removeChild(nextChild);
                curBody.removeChild(child);

                var titleSlide = makeSlide(mainTitle, subBase, 0, subTag);
                var titleBody = titleSlide.querySelector('.slide-body');
                titleBody.appendChild(child);
                printSlides.insertBefore(titleSlide, curSlide.nextSibling);

                curSlide = titleSlide;
                curBody = titleBody;
                group.push(curSlide);
                void curSlide.offsetHeight;
                continue;
              }
              curBody.removeChild(nextChild);
            }

            if (curSlide.scrollHeight <= MAX_H) continue;

            // First child on this slide must stay (avoid empty slides)
            if (curBody.children.length <= 1) {
              fitOverflowInSlide(curSlide);
              continue;
            }

            // This child causes overflow — move it to a new slide
            curBody.removeChild(child);
            var carryMinorTitle = null;
            var remainingChildren = Array.from(curBody.children);
            var previousChild = remainingChildren[remainingChildren.length - 1];
            if (isMinorTitleReveal(previousChild)) {
              carryMinorTitle = previousChild;
              curBody.removeChild(carryMinorTitle);
            }

            var newSlide = makeSlide(mainTitle, subBase, 0, subTag);
            var newBody = newSlide.querySelector('.slide-body');
            if (carryMinorTitle) newBody.appendChild(carryMinorTitle);
            newBody.appendChild(child);
            printSlides.insertBefore(newSlide, curSlide.nextSibling);

            curSlide = newSlide;
            curBody = newBody;
            group.push(curSlide);

            void curSlide.offsetHeight;

            // Single child alone exceeds MAX_H → shrink to fit
            if (curSlide.scrollHeight > MAX_H) {
              fitOverflowInSlide(curSlide);
            }
          }

          if (group.length > 1) {
            group.forEach(function (s, i) {
              var st = s.querySelector(':scope > .slide-header > .slide-subtitle');
              if (st) st.textContent = (st.dataset.base || st.textContent) + ' (' + (i + 1) + '/' + group.length + ')';
            });
          }
        });

        // Split overflowing group-blocks across slides
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote') || s.classList.contains('slide-footer')
            || s.classList.contains('slide-section-title')) return;
          if (s.querySelector('.instructor')) return;
          var body = s.querySelector('.slide-body');
          if (!body) return;
          void s.offsetHeight;
          if (s.scrollHeight <= MAX_H) return;

          // Find the overflowing group-block (may be the only child, or any child)
          var children = Array.from(body.children);
          for (var ci = 0; ci < children.length; ci++) {
            var reveal = children[ci];
            var groupBlock = reveal.querySelector(':scope > .group-block');
            if (!groupBlock) continue;

            var groupHeader = groupBlock.querySelector('.group-header');
            var groupBody = groupBlock.querySelector('.group-body');
            if (!groupBody || !groupHeader) continue;

            var groupChildren = Array.from(groupBody.children);
            if (groupChildren.length <= 1) continue;

            // Drain and re-pack group-body children
            while (groupBody.firstChild) groupBody.removeChild(groupBody.firstChild);

            var header = s.querySelector('.slide-header');
            var mainTitle = header ? (header.querySelector('.slide-title') || {}).textContent || '' : '';
            var stEl = header ? header.querySelector('.slide-subtitle') : null;
            var subBase = stEl ? (stEl.dataset.base || stEl.textContent) : '';
            var subTag = header ? headingTabTag(header) : '';

            var curSlide = s;
            var curGroupBody = groupBody;
            var splitGroup = [curSlide];

            function startContinuationSlide() {
              var newSlide = makeSlide(mainTitle, subBase, 0, subTag);
              var newBody = newSlide.querySelector('.slide-body');
              var newReveal = document.createElement('div');
              newReveal.className = 'reveal';
              var newGB = document.createElement('div');
              newGB.className = 'group-block';
              newGB.appendChild(groupHeader.cloneNode(true));
              var newGBody = document.createElement('div');
              newGBody.className = 'group-body';
              newGB.appendChild(newGBody);
              newReveal.appendChild(newGB);
              newBody.appendChild(newReveal);
              printSlides.insertBefore(newSlide, curSlide.nextSibling);

              curSlide = newSlide;
              curGroupBody = newGBody;
              splitGroup.push(curSlide);
              return newGBody;
            }

            for (var gi = 0; gi < groupChildren.length; gi++) {
              var gc = groupChildren[gi];
              curGroupBody.appendChild(gc);
              void curSlide.offsetHeight;

              // Keep #### with the first content block below it. If the pair does
              // not fit in the remaining space, start a new continuation slide at ####.
              if (isMinorTitleNode(gc) && groupChildren[gi + 1] && curGroupBody.children.length > 1) {
                var nextGc = groupChildren[gi + 1];
                curGroupBody.appendChild(nextGc);
                void curSlide.offsetHeight;
                if (curSlide.scrollHeight > MAX_H) {
                  curGroupBody.removeChild(nextGc);
                  curGroupBody.removeChild(gc);
                  startContinuationSlide().appendChild(gc);
                  void curSlide.offsetHeight;
                  continue;
                }
                curGroupBody.removeChild(nextGc);
              }

              if (curSlide.scrollHeight <= MAX_H) continue;

              // First child on this group-body must stay (avoid empty groups)
              if (curGroupBody.children.length <= 1) {
                fitOverflowInSlide(curSlide);
                continue;
              }

              curGroupBody.removeChild(gc);
              startContinuationSlide().appendChild(gc);
              void curSlide.offsetHeight;
              if (curSlide.scrollHeight > MAX_H) {
                fitOverflowInSlide(curSlide);
              }
            }

            if (splitGroup.length > 1) {
              splitGroup.forEach(function (sl, i) {
                var st = sl.querySelector(':scope > .slide-header > .slide-subtitle');
                if (st) st.textContent = (st.dataset.base || st.textContent) + ' (' + (i + 1) + '/' + splitGroup.length + ')';
              });
            }
            break; // one group-block per slide
          }
        });

        // 拆不開的單一區塊（一張 case／insight 卡就比一頁高）：fitOverflowInSlide 改 font-size 對 rem 尺寸無效，
        // 拆頁完還超出的就整個 .slide-body 用 zoom 縮。要在下面的 prompt-body 縮字之前：否則它看到整頁超出，
        // 會把程式碼縮到 8px
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote') || s.classList.contains('slide-footer')
            || s.classList.contains('slide-section-title')) return;
          void s.offsetHeight;
          if (s.scrollHeight > MAX_H) zoomBodyToFit(s);
        });

        // Keep #### minor titles with the content that follows. If packing leaves
        // a minor title at the bottom of one slide, move it to the next slide and
        // let that slide shrink its content as needed.
        var minorSlides = Array.from(printSlides.querySelectorAll('.slide'));
        for (var mi = 0; mi < minorSlides.length - 1; mi++) {
          var ms = minorSlides[mi];
          if (ms.classList.contains('slide-hero') || ms.classList.contains('slide-quote')
            || ms.classList.contains('slide-footer') || ms.classList.contains('slide-bonus')
            || ms.classList.contains('slide-section-title')) continue;
          var msBody = ms.querySelector('.slide-body');
          if (!msBody || !msBody.children.length) continue;
          var lastChild = msBody.children[msBody.children.length - 1];
          if (!isMinorTitleReveal(lastChild)) continue;

          var nextMs = minorSlides[mi + 1];
          if (nextMs.classList.contains('slide-hero') || nextMs.classList.contains('slide-quote')
            || nextMs.classList.contains('slide-footer') || nextMs.classList.contains('slide-bonus')
            || nextMs.classList.contains('slide-section-title')) continue;
          var nextMsBody = nextMs.querySelector('.slide-body');
          if (!nextMsBody) continue;
          nextMsBody.insertBefore(lastChild, nextMsBody.firstChild);
          void nextMs.offsetHeight;
          if (nextMs.scrollHeight > MAX_H) fitOverflowInSlide(nextMs);
        }

        // Auto-shrink individual prompt-body blocks that are too wide/tall
        Array.from(printSlides.querySelectorAll('.prompt-body')).forEach(function (pb) {
          var slide = pb.closest('.slide');
          if (!slide) return;
          var MIN_FONT = 8;
          var cur = parseFloat(getComputedStyle(pb).fontSize);
          var attempts = 0;
          while (attempts < 12 && cur > MIN_FONT) {
            void slide.offsetHeight;
            var slideOver = slide.scrollHeight > MAX_H;
            var pbOver = pb.scrollWidth > pb.clientWidth + 2;
            if (!slideOver && !pbOver) break;
            cur = Math.max(MIN_FONT, cur * 0.88);
            pb.style.fontSize = cur + 'px';
            pb.style.lineHeight = '1.5';
            attempts++;
          }
        });

        // Merge thin slides (orphaned sub-titles, empty groups) into next slide
        var thinSlides = Array.from(printSlides.querySelectorAll('.slide'));
        for (var ti = 0; ti < thinSlides.length - 1; ti++) {
          var ts = thinSlides[ti];
          if (ts.classList.contains('slide-hero') || ts.classList.contains('slide-quote')
            || ts.classList.contains('slide-footer') || ts.classList.contains('slide-bonus')
            || ts.classList.contains('slide-section-title')) continue;
          var tBody = ts.querySelector('.slide-body');
          if (!tBody || tBody.children.length === 0) continue;
          void ts.offsetHeight;
          if (tBody.scrollHeight > 80) continue;

          var nextTs = thinSlides[ti + 1];
          if (nextTs.classList.contains('slide-hero') || nextTs.classList.contains('slide-quote')
            || nextTs.classList.contains('slide-footer') || nextTs.classList.contains('slide-bonus')
            || nextTs.classList.contains('slide-section-title')) continue;
          var nextTBody = nextTs.querySelector('.slide-body');
          if (!nextTBody) continue;

          var movers = Array.from(tBody.children);
          for (var mj = movers.length - 1; mj >= 0; mj--) {
            nextTBody.insertBefore(movers[mj], nextTBody.firstChild);
          }
          void nextTs.offsetHeight;
          if (nextTs.scrollHeight > MAX_H) fitOverflowInSlide(nextTs);

          ts.remove();
          thinSlides.splice(ti, 1);
          ti--;
        }

        // Re-number split slides after merge (group by subtitle base)
        renumberSlideSubtitles();

        // 拆頁時 fitOverflowInSlide 縮過的 .flow，內容搬到下一頁後不會還原（整頁只填一半還是 .58）：
        // 收尾先全部歸 1，下面的 fitImagesInAllSlides 與 Final flow pass 只對真的溢出的頁重縮
        Array.from(printSlides.querySelectorAll('.flow')).forEach(function (f) { f.style.removeProperty('zoom'); });

        // Size images from each slide's real remaining height. This pass runs
        // after packing/merging so images can grow into the actual free space.
        fitImagesInAllSlides();

        // Final flow pass: long timelines should scale down gradually before
        // the slide gets clipped by the strict PDF page boundary.
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote') || s.classList.contains('slide-footer')
            || s.classList.contains('slide-section-title')) return;
          void s.offsetHeight;
          if (s.scrollHeight > MAX_H) {
            fitOverflowInSlide(s);
            if (s.scrollHeight > MAX_H) zoomBodyToFit(s);
          }
        });

        // Remove ghost slides whose body is empty or has negligible content
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          if (s.classList.contains('slide-hero') || s.classList.contains('slide-quote') || s.classList.contains('slide-footer')
            || s.classList.contains('slide-section-title')) return;
          if (s.querySelector('.instructor')) return;
          var body = s.querySelector('.slide-body');
          if (!body || body.children.length === 0 || body.scrollHeight < 50) {
            s.remove();
            return;
          }
          // Safety net: remove slides where the only content is a group-block with empty body
          var gb = body.querySelector('.group-body');
          if (gb && gb.children.length === 0 && body.querySelectorAll('.group-block').length === body.children.length) {
            s.remove();
          }
        });

        // Empty/ghost slides may be removed after split numbering. Normalize again
        // so a surviving single slide does not keep a stale "(2/2)" suffix.
        renumberSlideSubtitles();

        // Auto-shrink special slides (hero, quote, footer, instructor) via zoom
        // rem is relative to <html> root, not container — fontSize on container has no effect.
        // zoom scales everything including rem-based sizes.
        function shrinkSlideToFit(s) {
          void s.offsetHeight;
          if (s.scrollHeight <= MAX_H) return;
          var children = Array.from(s.children);
          if (!children.length) return;
          var attempts = 0;
          while (s.scrollHeight > MAX_H && attempts < 10) {
            var ratio = (MAX_H - 2) / s.scrollHeight;
            children.forEach(function (child) {
              var curZoom = parseFloat(child.style.zoom) || 1;
              child.style.zoom = (curZoom * ratio).toFixed(4);
            });
            void s.offsetHeight;
            attempts++;
          }
        }
        Array.from(printSlides.querySelectorAll('.slide-hero, .slide-quote, .slide-footer, .slide-section-title')).forEach(shrinkSlideToFit);

        // Final clamp: every slide is strictly 720px, no bleeding
        Array.from(printSlides.querySelectorAll('.slide')).forEach(function (s) {
          s.style.setProperty('max-height', MAX_H + 'px', 'important');
          s.style.setProperty('overflow', 'hidden', 'important');
        });

        // Set CSS variable so @media print uses the scaled font-size,
        // then restore the original web font-size for the live page.
        document.documentElement.style.setProperty('--print-font-size', printFontSize + 'px');
        document.documentElement.style.fontSize = origFontSize;

        // Remove measurement styles and print
        printSlides.removeAttribute('style');
        document.body.classList.add('printing');
        if (printPreview) {
          // 量測照常在螢幕規則下完成（與按鈕匯出同一條路徑），到這裡才讓 print 規則生效；
          // body 的 padding-left 有 .35s transition（側欄讓位），關掉才能在 printReady 當下就截圖
          document.body.style.transition = 'none';
          applyPrintMediaToScreen();
          void document.body.offsetHeight;
          window.__coursePage.printReady = true;
          return;
        }
        window.print();
        setTimeout(function () {
          document.body.classList.remove('printing');
          if (printSlides.parentNode) document.body.removeChild(printSlides);
        }, 500);

      } // end runPackerAndPrint

      // Kick off：每張圖都 load／error 之後才排版、列印（上限 90 秒）。網路慢時沒載完的大圖高度是 0，
      // 照那個高度排出來的頁，列印時圖一到就撐破 720px。等待期間顯示「載入圖片 n／N」；
      // 逾時後才載完的圖不能再觸發第二次 packer。?print=1 的 printReady 在 packer 收尾才設，所以也等這一步
      var packerStarted = false;
      var progressEl = null;
      function startPacker() {
        if (packerStarted) return;
        packerStarted = true;
        if (progressEl && progressEl.parentNode) progressEl.parentNode.removeChild(progressEl);
        runPackerAndPrint();
      }
      if (!unloaded.length) {
        startPacker();
      } else {
        var imgDone = allImgs.length - unloaded.length;
        progressEl = document.createElement('div');
        progressEl.className = 'pdf-progress';
        progressEl.setAttribute('role', 'status');
        progressEl.innerHTML = '<div class="pdf-progress__box"></div>';
        var progressText = progressEl.firstChild;
        var showProgress = function () { progressText.textContent = '匯出 PDF：載入圖片 ' + imgDone + '／' + allImgs.length; };
        showProgress();
        document.body.appendChild(progressEl);
        unloaded.forEach(function (img) {
          img.onload = img.onerror = function () {
            imgDone++;
            showProgress();
            if (imgDone >= allImgs.length) startPacker();
          };
        });
        setTimeout(startPacker, 90000);
      }
    }

    // ?print=1 用：每條 @media print 規則原地追加 screen 媒體（不複製規則 → 層疊順序與真正列印一致，
    // theme.css 也不必維護第二份 print 樣式）。跨網域樣式表（Google Fonts）讀不到 cssRules，略過。
    function applyPrintMediaToScreen() {
      function walk(list) {
        Array.prototype.forEach.call(list, function (rule) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            Array.prototype.slice.call(rule.media).forEach(function (m) {
              if (/\bprint\b/.test(m) && !/\bnot\b/.test(m)) rule.media.appendMedium(m.replace(/\bprint\b/, 'screen'));
            });
          }
          if (rule.cssRules) walk(rule.cssRules);
        });
      }
      Array.prototype.forEach.call(document.styleSheets, function (sheet) {
        var rules;
        try { rules = sheet.cssRules; } catch (e) { return; }
        if (rules) walk(rules);
      });
    }

    function makeSlide(mainTitle, subTitle, pageNum, subTagHtml) {
      var slide = document.createElement('div');
      slide.className = 'slide';

      var header = document.createElement('div');
      header.className = 'slide-header';

      var titleEl = document.createElement('h2');
      titleEl.className = 'slide-title';
      titleEl.textContent = mainTitle;
      header.appendChild(titleEl);

      if (subTitle) {
        var subEl = document.createElement('h3');
        subEl.className = 'slide-subtitle';
        subEl.dataset.base = subTitle;
        subEl.textContent = pageNum > 0 ? subTitle + ' (' + pageNum + ')' : subTitle;
        header.appendChild(subEl);
      }

      // 工具分頁 chip 掛在 header 上（獨立於 subtitle 文字，renumber 重寫 textContent 也不會清掉）
      if (subTagHtml) header.insertAdjacentHTML('beforeend', subTagHtml);

      var body = document.createElement('div');
      body.className = 'slide-body';
      slide.appendChild(header);
      slide.appendChild(body);
      return slide;
    }

    // ===== PRESENTATION MODE =====（?present=1 或 data-mode="presentation" 載入即進簡報）
    init('presentation', function () {
      var slides = [];
      var slideIdx = 0;

      var enterBtn = document.createElement('button');
      enterBtn.className = 'pres-enter-btn';
      enterBtn.innerHTML = '&#9654; 簡報模式 <kbd style="font-size:.7rem;margin-left:.2rem">P</kbd>';
      enterBtn.addEventListener('click', enterPresentation);
      document.body.appendChild(enterBtn);

      var progressBar = document.createElement('div');
      progressBar.className = 'pres-progress-bar';
      progressBar.innerHTML = '<div class="pres-progress-fill" id="pres-progress-fill"></div>';
      document.body.appendChild(progressBar);

      var presDefault = document.documentElement.dataset.mode === 'presentation'
        || /[?&]present(?:=|&|$)/.test(location.search);
      if (presDefault) enterPresentation();

      document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          document.body.classList.contains('pres-active') ? exitPresentation() : enterPresentation();
        }
      });

      function enterPresentation() {
        if (document.getElementById('pres-deck')) return;

        var deck = document.createElement('div');
        deck.id = 'pres-deck';
        slides = [];
        slideIdx = 0;

        var allSections = document.querySelectorAll('section.section:not(.section--header)');

        // Hero
        var hero = document.querySelector('header.hero');
        if (hero) {
          var hs = mkSlide('pres-slide--hero');
          hs.dataset.sourceId = 'hero';
          var hc = hero.cloneNode(true);
          hc.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
          hs.appendChild(hc);
          slides.push(hs);
        }

        // Walk all top-level slide-bearing nodes in document order so lab/qa/survey
        // pages keep their actual position relative to sections. Sections split by
        // an inline lab/qa/survey (continuation sections without a .section-label)
        // inherit the previous chapter's context so their content stays grouped under
        // the correct chapter header instead of being dropped or re-titled.
        var presSectionOrdinal = 0;
        var prevChapterCtx = null;
        var prevSubTitle = '';
        var prevSubId = '';
        var prevSubTag = '';
        var presOrdered = document.querySelectorAll('section.section, section.quote-page, section.qa-page, section.lab-page, section.interactive-page, section.survey-page');
        presOrdered.forEach(function (section) {
          if (section.classList.contains('section--header')) {
            // 頁首（第一個 # 之前）只有 [feedback] 進簡報：一張置中的按鈕頁，點擊照樣開彈窗
            section.querySelectorAll('.feedback-wrap').forEach(function (wrap) {
              var btn = wrap.querySelector('.feedback-btn');
              var fs = mkSlide('pres-slide--feedback');
              var box = document.createElement('div');
              box.className = 'pres-feedback';
              var h = document.createElement('h2');
              h.textContent = btn ? (btn.dataset.feedbackTitle || '') : '';
              box.appendChild(h);
              box.appendChild(wrap.cloneNode(true));
              fs.appendChild(box);
              slides.push(fs);
            });
            return;
          }
          if (!section.classList.contains('section')) {
            var qs = cloneQuoteSlide(section);
            qs.dataset.sourceId = section.id || 'quote-slide';
            stampPaneRef(qs, section);
            slides.push(qs);
            return;
          }
          var labelEl = section.querySelector('.section-label');
          var isContinuation = !labelEl;
          if (isContinuation && !prevChapterCtx) return;

          var sectionName, sectionNum = '', sectionTitle = '', sectionLead = '', presSectionNum = '', srcId, isInstructorSection = false;
          if (isContinuation) {
            sectionName = prevChapterCtx.sectionName;
            presSectionNum = prevChapterCtx.presSectionNum;
            srcId = prevChapterCtx.srcId;
          } else {
            var numEl = labelEl.querySelector('.num');
            sectionNum = numEl ? numEl.textContent.trim() : '';
            var h2El = section.querySelector('h2');
            sectionTitle = h2El ? h2El.textContent.trim() : '';
            var leadEl = section.querySelector('.lead');
            sectionLead = leadEl ? leadEl.innerHTML : '';
            sectionName = labelEl.textContent.replace(sectionNum, '').trim();
            isInstructorSection = labelEl.id === 'instructor';
            if (!isInstructorSection) presSectionOrdinal++;
            presSectionNum = sectionNum === '★' ? String(presSectionOrdinal) : sectionNum;
            srcId = labelEl.id || section.id || '';
            prevChapterCtx = { sectionName: sectionName, presSectionNum: presSectionNum, srcId: srcId };
            prevSubTitle = '';
            prevSubId = '';
            prevSubTag = '';
          }

          // Instructor section → single slide (no separate title slide)
          if (isInstructorSection) {
            var instrEl = section.querySelector('.instructor');
            if (instrEl) {
              var is = mkContentSlide(sectionName, '', instrEl.cloneNode(true));
              slides.push(is);
            }
            return;
          }

          // Collect reveal children, split into pre-blocks (before first ##/###) and rest.
          // Continuation sections skip the title slide entirely (no pre-blocks).
          var allReveals = [];
          var preBlockCount = 0;
          var foundSubOrGroup = isContinuation;
          var isSummarySection = !isContinuation && (labelEl.id === 'summary' || sectionName === '總結');
          Array.from(section.children).forEach(function (child) {
            if (child.nodeType !== 1 || !child.classList.contains('reveal')) return;
            if (child.querySelector('.section-label')) return;
            // 工具分頁的分頁列不進簡報（各 pane 全數展開、以 chip 標示）
            if (child.querySelector(':scope > .tab-bar')) return;
            if (!foundSubOrGroup) {
              if (isSummarySection && child.querySelector(':scope > .summary-grid, :scope > .bonus-btn')) {
                foundSubOrGroup = true;
              } else if (child.querySelector(':scope > .sub-title') || child.querySelector(':scope > .group-block')) {
                foundSubOrGroup = true;
              } else {
                preBlockCount++;
              }
            }
            allReveals.push(child);
          });

          // Title slide — merge pre-blocks into it. Skipped for continuation sections.
          if (!isContinuation) {
            var ts = mkSlide('pres-slide--title');
            ts.dataset.sourceId = srcId;
            var titleInner = document.createElement('div');
            titleInner.className = 'pres-title-inner';
            titleInner.innerHTML = '<div class="pres-section-num">' + presEsc(presSectionNum) + '</div>'
              + '<h2>' + presEsc(sectionTitle) + '</h2>'
              + (sectionLead ? '<p class="pres-lead">' + sectionLead + '</p>' : '');
            for (var pi = 0; pi < preBlockCount; pi++) {
              var clone = allReveals[pi].cloneNode(true);
              clone.classList.add('visible');
              titleInner.appendChild(clone);
            }
            ts.appendChild(titleInner);
            slides.push(ts);
          }

          var currentSub = isContinuation ? prevSubTitle : '';
          var currentSubId = isContinuation ? prevSubId : '';
          var currentSubTag = isContinuation ? prevSubTag : '';
          var currentSlide = null;

          allReveals.forEach(function (child, idx) {
            if (!isContinuation && idx < preBlockCount) return;

            var subEl = child.querySelector(':scope > .sub-title');
            if (subEl) {
              currentSub = headingText(subEl);
              currentSubId = subEl.id || '';
              currentSubTag = headingTabTag(subEl);
              currentSlide = null;
              return;
            }

            var anchorId = currentSubId || srcId;
            var idEl = child.querySelector('[id]');
            if (idEl) anchorId = idEl.id;

            var groupEl = child.querySelector(':scope > .group-block');
            if (groupEl) {
              currentSlide = mkContentSlide(sectionName, currentSub, groupEl.cloneNode(true), currentSubTag);
              currentSlide.dataset.sourceId = srcId;
              currentSlide.dataset.anchorId = anchorId;
              stampPaneRef(currentSlide, child);
              slides.push(currentSlide);
              return;
            }

            var ytEl = child.querySelector(':scope > .youtube-embed');
            if (ytEl) {
              var ys = mkContentSlide(sectionName, currentSub, ytEl.cloneNode(true), currentSubTag);
              ys.dataset.sourceId = srcId;
              ys.dataset.anchorId = anchorId;
              stampPaneRef(ys, child);
              slides.push(ys);
              currentSlide = null;
              return;
            }

            var clone = child.cloneNode(true);
            clone.classList.add('visible');
            if (currentSlide) {
              currentSlide.querySelector('.pres-content').appendChild(clone);
            } else {
              currentSlide = mkContentSlide(sectionName, currentSub, clone, currentSubTag);
              currentSlide.dataset.sourceId = srcId;
              currentSlide.dataset.anchorId = anchorId;
              stampPaneRef(currentSlide, child);
              slides.push(currentSlide);
            }
          });

          prevSubTitle = currentSub;
          prevSubId = currentSubId;
          prevSubTag = currentSubTag;
        });

        // Find the slide matching the currently visible content (fine-grained)
        var startIdx = 0;
        var viewMid = window.scrollY + window.innerHeight / 3;

        // Collect all anchors: hero, quote-pages, section-labels, sub-titles, and any [id] inside sections
        var anchors = [];
        var heroEl = document.querySelector('header.hero');
        if (heroEl) anchors.push({ el: heroEl, id: 'hero' });
        document.querySelectorAll('section.quote-page, section.qa-page, section.lab-page, section.interactive-page, section.survey-page, .section-label[id], .sub-title[id], .group-block').forEach(function (el) {
          var aid = el.id;
          if (!aid && el.classList.contains('group-block')) {
            var prev = el.closest('.reveal');
            if (prev) {
              var sub = prev.previousElementSibling;
              while (sub && !sub.querySelector('.sub-title')) sub = sub.previousElementSibling;
              if (sub) { var st = sub.querySelector('.sub-title'); if (st) aid = st.id; }
            }
          }
          if (aid) anchors.push({ el: el, id: aid });
        });

        var matchId = '';
        for (var ai = anchors.length - 1; ai >= 0; ai--) {
          // 隱藏 pane 內的元素 rect 為 0，會誤判成目前位置 —— 跳過（與 scroll-spy 同規則）
          if (!anchors[ai].el.getClientRects().length) continue;
          if (anchors[ai].el.getBoundingClientRect().top + window.scrollY <= viewMid) {
            matchId = anchors[ai].id;
            break;
          }
        }

        if (matchId) {
          // Try anchorId first (fine-grained), fall back to sourceId (section-level)
          for (var fi = 0; fi < slides.length; fi++) {
            if (slides[fi].dataset.anchorId === matchId || slides[fi].dataset.sourceId === matchId) {
              startIdx = fi; break;
            }
          }
        }

        slideIdx = startIdx;
        slides.forEach(function (s, i) {
          if (i === startIdx) s.classList.add('active');
          deck.appendChild(s);
        });

        document.body.appendChild(deck);
        document.body.classList.add('pres-active');
        updateProgress();
        requestAnimationFrame(fitActiveSlide);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitActiveSlide);
        window.addEventListener('resize', presResizeHandler);

        document.addEventListener('keydown', presKeyHandler);

        var touchX = 0;
        deck.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].screenX; }, { passive: true });
        deck.addEventListener('touchend', function (e) {
          var dx = e.changedTouches[0].screenX - touchX;
          if (Math.abs(dx) > 50) goSlide(slideIdx + (dx > 0 ? -1 : 1));
        });

        deck.addEventListener('click', function (e) {
          if (e.target.closest('a, button, input, textarea, .prompt-block, iframe')) return;
          goSlide(slideIdx + (e.clientX / window.innerWidth < 0.25 ? -1 : 1));
        });
      }

      function exitPresentation() {
        var curSlide = slides[slideIdx];
        var targetId = curSlide ? (curSlide.dataset.anchorId || curSlide.dataset.sourceId) : '';
        // 目前 slide 來自某個 tab pane 時，退出前先把主頁面切到該 pane
        if (curSlide && curSlide.dataset.tabGroup) {
          activateTabPane(curSlide.dataset.tabGroup, curSlide.dataset.tabPane);
        }
        document.body.classList.remove('pres-active');
        var deck = document.getElementById('pres-deck');
        if (deck) deck.remove();
        document.removeEventListener('keydown', presKeyHandler);
        window.removeEventListener('resize', presResizeHandler);
        if (document.fullscreenElement) document.exitFullscreen();
        slides = [];
        slideIdx = 0;
        if (targetId) {
          var el = targetId === 'hero'
            ? document.querySelector('header.hero')
            : document.getElementById(targetId);
          if (el) {
            revealTabPaneFor(el); // 錨點若在非作用中 pane 內，先切過去再捲動
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
        }
      }

      function presKeyHandler(e) {
        if (!document.body.classList.contains('pres-active')) return;
        if (document.querySelector('.bonus-overlay.visible.is-feedback')) return; // 回饋彈窗開著時不換頁
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.key) {
          case 'ArrowRight': case 'ArrowDown': case ' ':
            e.preventDefault(); goSlide(slideIdx + 1); break;
          case 'ArrowLeft': case 'ArrowUp': case 'Backspace':
            e.preventDefault(); goSlide(slideIdx - 1); break;
          case 'Home': e.preventDefault(); goSlide(0); break;
          case 'End': e.preventDefault(); goSlide(slides.length - 1); break;
          case 'f': case 'F':
            if (!e.ctrlKey && !e.metaKey) {
              document.fullscreenElement
                ? document.exitFullscreen()
                : document.documentElement.requestFullscreen().catch(function () { });
            }
            break;
          case 'Escape':
            document.fullscreenElement ? document.exitFullscreen() : exitPresentation();
            break;
        }
      }

      function goSlide(n) {
        if (!slides.length) return;
        n = Math.max(0, Math.min(n, slides.length - 1));
        if (n === slideIdx) return;
        slides[slideIdx].classList.remove('active');
        slideIdx = n;
        slides[slideIdx].classList.add('active');
        var pc = slides[slideIdx].querySelector('.pres-content');
        if (pc) pc.scrollTop = 0;
        updateProgress();
        fitSlide(slides[slideIdx]);
      }

      function fitSlide(slide) {
        fitQuoteSlide(slide);
        fitTitleSlide(slide);
        fitContentSlide(slide);
      }

      // 章節標題頁（標題＋併進來的前導區塊，例如課程時間軸卡）比可用高度（扣掉上下 padding）高時，
      // 跟 fitQuoteSlide 一樣用 transform: scale 縮進畫面；只在溢出時縮，下限 .6。
      function fitTitleSlide(slide) {
        if (!slide || !slide.classList.contains('pres-slide--title')) return;
        var inner = slide.querySelector('.pres-title-inner');
        if (!inner) return;
        inner.style.transform = '';
        var cs = getComputedStyle(slide);
        var avail = slide.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        var need = inner.scrollHeight;
        if (avail > 0 && need > avail) {
          inner.style.transformOrigin = 'center center';
          inner.style.transform = 'scale(' + Math.max(.6, avail / need) + ')';
        }
      }

      // 內容頁：可見內容只超出一點（縮到 .8 以內就放得下）時用 zoom 縮進去免捲動；要縮得更小就維持原尺寸
      // 照舊捲動 —— 字太小不如捲動。需求高度量「有畫出東西」的框（文字、圖、有底色或邊框）的最低點，
      // 不用 scrollHeight：結尾的 padding／margin 會把它撐大（demo 時間軸頁多約 90px），放得下的也會被縮。
      // zoom 會讓版面重排、高度不一定等比例縮，所以縮完再量，還放不下就照新量測再縮，低於 .8 就還原。
      function fitContentSlide(slide) {
        if (!slide || !slide.classList.contains('pres-slide--content')) return;
        var pc = slide.querySelector('.pres-content');
        if (!pc) return;
        pc.style.zoom = '';
        if (pc.scrollHeight <= pc.clientHeight) return;
        var keepScroll = pc.scrollTop;
        pc.scrollTop = 0;
        var z = 1;
        for (var pass = 0; pass < 4; pass++) {
          var box = pc.getBoundingClientRect();
          var need = paintedBottom(pc) - box.top;
          if (need <= box.height + 1) return;
          z = Math.floor(z * box.height / need * 1000) / 1000;
          if (z < .8 || pass === 3) break;
          pc.style.zoom = String(z);
        }
        pc.style.zoom = '';
        pc.scrollTop = keepScroll;
      }

      function paintedBottom(root) {
        var b = 0;
        root.querySelectorAll('*').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) return;
          var cs = getComputedStyle(el);
          if (cs.visibility === 'hidden') return;
          var painted = /^(img|video|canvas|iframe|svg)$/i.test(el.tagName)
            || parseFloat(cs.borderBottomWidth) > 0
            || cs.backgroundImage !== 'none'
            || !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor)
            || Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
          if (painted) b = Math.max(b, r.bottom);
        });
        return b;
      }

      // Shrink a quote-type slide (lab/qa/interactive/survey/quote) to fit the
      // viewport height when its content overflows, so steps never get clipped.
      function fitQuoteSlide(slide) {
        if (!slide || !slide.classList.contains('pres-slide--quote')) return;
        var page = slide.querySelector('.lab-page, .qa-page, .interactive-page, .survey-page, .quote-page');
        if (!page) return;
        page.style.transform = '';
        page.style.overflow = '';
        var avail = slide.clientHeight;
        var need = page.scrollHeight;
        if (avail && need > avail) {
          page.style.transformOrigin = 'center center';
          page.style.transform = 'scale(' + (avail / need) + ')';
          // transform is visual-only; release the layout-level overflow clip so
          // the scaled-in content isn't cut by lab-page's original boundary.
          page.style.overflow = 'visible';
        }
      }

      function fitActiveSlide() {
        if (slides.length) fitSlide(slides[slideIdx]);
      }

      function presResizeHandler() { fitActiveSlide(); }

      function updateProgress() {
        var pct = slides.length ? ((slideIdx + 1) / slides.length * 100) : 0;
        var fill = document.getElementById('pres-progress-fill');
        if (fill) fill.style.width = pct.toFixed(1) + '%';
        var deck = document.getElementById('pres-deck');
        if (deck) {
          deck.querySelectorAll('.pres-counter').forEach(function (c) {
            c.textContent = (slideIdx + 1) + ' / ' + slides.length;
          });
        }
      }

      // slide 記住來源所屬的 tab pane（退出簡報時還原分頁用）
      function stampPaneRef(slide, srcEl) {
        var pane = srcEl && srcEl.closest ? srcEl.closest('[data-tabpane]') : null;
        if (pane) {
          slide.dataset.tabGroup = pane.getAttribute('data-tabgroup');
          slide.dataset.tabPane = pane.getAttribute('data-tabpane');
        }
      }

      function mkSlide(cls) {
        var el = document.createElement('div');
        el.className = 'pres-slide ' + (cls || '');
        return el;
      }

      function cloneQuoteSlide(qp) {
        var qs = mkSlide('pres-slide--quote');
        var qc = qp.cloneNode(true);
        qc.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        qs.appendChild(qc);
        return qs;
      }

      function mkContentSlide(sectionName, subTitle, content, subTagHtml) {
        var slide = mkSlide('pres-slide--content');

        var bc = document.createElement('div');
        bc.className = 'pres-breadcrumb';
        bc.innerHTML = '<div class="pres-breadcrumb-path">'
          + '<span class="section-name">' + presEsc(sectionName) + '</span>'
          + (subTitle ? '<span class="sep">\u203A</span><span>' + presEsc(subTitle) + '</span>' : '')
          + (subTagHtml || '') // \u5DE5\u5177\u5206\u9801 chip\uFF08\u4F86\u6E90 HTML \u70BA build \u7522\u51FA\uFF0C\u975E\u4F7F\u7528\u8005\u8F38\u5165\uFF09
          + '</div>'
          + '<span class="pres-counter"></span>';
        slide.appendChild(bc);

        var contentDiv = document.createElement('div');
        contentDiv.className = 'pres-content';
        content.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('visible'); });
        contentDiv.appendChild(content);
        slide.appendChild(contentDiv);

        return slide;
      }

      function presEsc(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
      }
    });

    // Prompt 區塊：複製鈕走 onclick="copyPrompt(this)"（全域函式）；超過 10 行的收合
    init('copy', function () {
      document.querySelectorAll('.prompt-body').forEach(function (body) {
        var lineCount = body.textContent.split('\n').length;
        if (lineCount <= 10) return;
        var block = body.closest('.prompt-block');
        if (!block) return;
        body.classList.add('is-collapsed');
        var bar = document.createElement('div');
        bar.className = 'prompt-expand-bar';
        bar.innerHTML = '<button class="prompt-expand-btn" onclick="togglePromptExpand(this)">展開 ▾</button>';
        block.appendChild(bar);
      });
    });

    function togglePromptExpand(btn) {
      var block = btn.closest('.prompt-block');
      var body = block.querySelector('.prompt-body');
      var isCollapsed = body.classList.toggle('is-collapsed');
      btn.textContent = isCollapsed ? '展開 ▾' : '收合 ▴';
    }

    // QRCode 彈窗＋WiFi 資訊（原本是 base.html 裡獨立的 <script>，併進來統一防護）
    init('qr-wifi', function () {
      var btn = document.getElementById('qr-code-btn');
      var overlay = document.getElementById('qr-overlay');
      var closeBtn = document.getElementById('qr-modal-close');
      if (!btn || !overlay) return;
      // 沒有可用網址（QR 未生成）時，隱藏整組入口（含 WiFi 設定）
      if (!document.querySelector('#qr-code-box svg')) {
        var sec = document.getElementById('qr-settings-section');
        if (sec) sec.style.display = 'none';
        return;
      }

      // ── WiFi 資訊：只存講師瀏覽器的 localStorage，不進公開 HTML ──
      var WIFI_KEY = 'courseWifi';
      var ssidInput = document.getElementById('wifi-ssid');
      var passInput = document.getElementById('wifi-pass');
      var saveBtn = document.getElementById('wifi-save-btn');
      var clearBtn = document.getElementById('wifi-clear-btn');
      // QR／WiFi 彈窗是一組完整元件：缺任何一件就整段不綁
      if (!ssidInput || !passInput || !saveBtn || !clearBtn || !document.getElementById('qr-wifi-pane')
        || !document.getElementById('qr-modal') || !document.getElementById('qr-wifi-ssid')
        || !document.getElementById('qr-wifi-pass')) return;
      function loadWifi() {
        try { return JSON.parse(safeStorage.get(WIFI_KEY) || 'null'); } catch (e) { return null; }
      }
      var saved = loadWifi();
      if (saved) { ssidInput.value = saved.ssid || ''; passInput.value = saved.pass || ''; }
      function flash(el, text) {
        var orig = el.textContent;
        el.textContent = text;
        setTimeout(function () { el.textContent = orig; }, 1200);
      }
      saveBtn.addEventListener('click', function () {
        var ssid = ssidInput.value.trim();
        if (!ssid) { flash(saveBtn, '先填名稱'); return; }
        flash(saveBtn, safeStorage.set(WIFI_KEY, JSON.stringify({ ssid: ssid, pass: passInput.value })) ? '✓ 已儲存' : '無法儲存');
      });
      clearBtn.addEventListener('click', function () {
        safeStorage.remove(WIFI_KEY);
        ssidInput.value = ''; passInput.value = '';
        flash(clearBtn, '✓ 已清除');
      });

      // WiFi 資訊直接大字顯示（不產 QR）：現場看得清楚、能照著打字最重要
      function renderWifiPane() {
        var pane = document.getElementById('qr-wifi-pane');
        var modal = document.getElementById('qr-modal');
        var w = loadWifi();
        if (!w || !w.ssid) {
          pane.hidden = true; modal.classList.remove('has-wifi'); return;
        }
        document.getElementById('qr-wifi-ssid').textContent = '📶 ' + w.ssid;
        document.getElementById('qr-wifi-pass').textContent = w.pass ? '🔑 ' + w.pass : '（開放網路，無密碼）';
        pane.hidden = false; modal.classList.add('has-wifi');
      }

      function openQr() {
        var sp = document.getElementById('settings-panel');
        if (sp) sp.classList.remove('open');
        var st = document.getElementById('settings-toggle');
        if (st) st.classList.remove('active');
        renderWifiPane();
        overlay.classList.add('open');
      }
      function closeQr() { overlay.classList.remove('open'); }
      btn.addEventListener('click', openQr);
      if (closeBtn) closeBtn.addEventListener('click', closeQr);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeQr(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQr(); });
    });
