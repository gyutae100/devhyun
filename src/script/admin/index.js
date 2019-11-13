import * as dashboard from "./dashboard";
import * as schedule from "./schedule";
import * as task from "./task";
import * as note from "./note";
import * as blog from "./blog";

const modules = Object.assign(dashboard, schedule, task, note, blog);

const set = namespace => {
  const app = fx.go(
    Object.values(modules),
    fx.filter(e => e.namespace == namespace),
    e => e[0]
  );
  app.init();
  window.APP = app;
};

export const init = () => {
  // 마크다운 하이라이트 처리
  hljs.initHighlightingOnLoad();

  // 햄버거 메뉴 처리
  $("#burger").click(function() {
    $("header .lnb").toggleClass("collapse");
  });

  $("#overlay").click(function() {
    $("header .lnb").removeClass("collapse");
  });

  return set;
};
