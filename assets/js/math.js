/* Render maths in notes.
   Two inputs are supported: $$...$$ that kramdown has already turned into
   <script type="math/tex">, and $...$ left as plain text in the paragraph. */
(function () {
  function convertScript(node) {
    var tex = node.textContent;
    var display = /mode=display/.test(node.getAttribute("type") || "");
    var span = document.createElement("span");
    span.className = display ? "math-display" : "math-inline";
    try {
      window.katex.render(tex, span, { displayMode: display, throwOnError: false });
    } catch (error) {
      span.textContent = tex;
    }
    node.parentNode.replaceChild(span, node);
  }

  function start() {
    if (!window.katex) return;

    var scripts = document.querySelectorAll('script[type^="math/tex"]');
    for (var i = 0; i < scripts.length; i += 1) convertScript(scripts[i]);

    var root = document.querySelector(".prose") || document.body;
    if (window.renderMathInElement) {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false,
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
      });
    }

    // Wide display equations scroll sideways; give them keyboard access.
    var isChinese = /^zh/i.test(document.documentElement.lang || "");
    var markScrollable = function () {
      var displays = root.querySelectorAll(".katex-display");
      for (var j = 0; j < displays.length; j += 1) {
        var equation = displays[j];
        if (equation.hasAttribute("tabindex")) continue;
        if (equation.scrollWidth > equation.clientWidth + 1) {
          equation.setAttribute("tabindex", "0");
          equation.setAttribute("role", "group");
          equation.setAttribute("aria-label", isChinese ? "公式，可横向滚动" : "Equation, scrollable horizontally");
        }
      }
    };
    markScrollable();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(markScrollable);
    window.addEventListener("resize", markScrollable);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();