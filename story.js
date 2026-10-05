(function () {
  var steps = [
    { title: "Find", body: "Discover CUI across the systems, repositories, and data sources approved for review." },
    { title: "Prove", body: "Validate findings and produce evidence that helps executives, compliance teams, advisors, and security leaders understand whether the documented boundary matches the actual environment." },
    { title: "Monitor", body: "Run recurring scans to identify new CUI, movement between systems, spillage outside approved locations, and boundary drift before the next assessment, affirmation, prime contractor request, or internal review." }
  ];
  var label = document.getElementById("chapter-label");
  var title = document.getElementById("chapter-title");
  var body = document.getElementById("chapter-body");
  var buttons = Array.prototype.slice.call(document.querySelectorAll("#rail button"));
  var index = 0;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    index = i;
    label.textContent = "Chapter " + (i + 1) + " of " + steps.length;
    title.textContent = steps[i].title;
    body.textContent = steps[i].body;
    buttons.forEach(function (btn, n) {
      if (n === i) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      show(Number(btn.getAttribute("data-step")));
    });
  });

  if (!reduced) {
    setInterval(function () {
      show((index + 1) % steps.length);
    }, 7000);
  }
  show(0);
})();
