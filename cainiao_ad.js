/**
 * Quantumult X 菜鸟去广告脚本
 * V3：处理真实 HAR 中确认的开屏广告、CPS 商品推广、首页弹窗和广告气泡。
 * 保留查件、取件、寄件、出库码、回收、积分及账号相关功能。
 */

const 明确营销入口 = new Set(["packageQa", "sawPuzzle"]);
const 营销搜索词 = /有奖|赚赚|赢红包/;
const 请求地址 = $request.url;

function 清理专用广告接口(响应数据) {
  if (!请求地址.includes("nbnetflow.ads.")) return 0;
  if (!响应数据?.data || typeof 响应数据.data !== "object") return 0;

  let 删除数量 = 0;

  if (Array.isArray(响应数据.data.result)) {
    删除数量 += 响应数据.data.result.length;
    响应数据.data.result = [];
    return 删除数量;
  }

  for (const 广告位编号 of Object.keys(响应数据.data)) {
    const 广告列表 = 响应数据.data[广告位编号];
    if (!Array.isArray(广告列表)) continue;
    删除数量 += 广告列表.length;
    响应数据.data[广告位编号] = [];
  }

  return 删除数量;
}

function 清理联盟商品推荐(响应数据) {
  if (!请求地址.includes("nbcps.presentation.fetch")) return 0;

  const 商品流 = 响应数据?.data?.deal?.feeds;
  if (!Array.isArray(商品流)) return 0;

  let 删除数量 = 0;
  for (const 商品分组 of 商品流) {
    const 商品列表 = 商品分组?.data?.items;
    if (Array.isArray(商品列表)) 删除数量 += 商品列表.length;
  }

  响应数据.data.deal.feeds = [];
  return 删除数量;
}

function 清理弹窗广告(页面数据) {
  let 删除数量 = 0;
  const 弹窗容器 = 页面数据?.modalList?.data?.data;

  if (Array.isArray(弹窗容器?.items)) {
    for (const 广告位 of 弹窗容器.items) {
      if (!Array.isArray(广告位?.adsShowDTOList)) continue;
      删除数量 += 广告位.adsShowDTOList.length;
      广告位.adsShowDTOList = [];
    }
  }

  const 广告开关容器 = 页面数据?.switch?.data?.data;
  if (Array.isArray(广告开关容器?.items)) {
    删除数量 += 广告开关容器.items.length;
    广告开关容器.items = [];
  }

  return 删除数量;
}

function 清理广告气泡(项目) {
  if (!项目 || typeof 项目 !== "object") return 0;

  let 删除数量 = 0;
  if ("bubbleAdUtArgs" in 项目 || "bubbleText" in 项目) {
    delete 项目.bubbleAdUtArgs;
    delete 项目.bubbleText;
    删除数量 += 1;
  }

  for (const 事件字段 of ["exposureEvent", "tapEvent"]) {
    if (!Array.isArray(项目[事件字段])) continue;
    项目[事件字段] = 项目[事件字段].filter(
      (事件) => !JSON.stringify(事件).includes("bubbleAdKey")
    );
  }

  return 删除数量;
}

function 清理首页营销(页面数据) {
  const 首页数据 = 页面数据?.data;
  if (!首页数据 || typeof 首页数据 !== "object") return 0;

  let 删除数量 = 0;

  if (Array.isArray(首页数据.operationList)) {
    for (const 功能分组 of 首页数据.operationList) {
      const 项目列表 = 功能分组?.bizData?.items;
      if (!Array.isArray(项目列表)) continue;

      for (const 项目 of 项目列表) 删除数量 += 清理广告气泡(项目);

      功能分组.bizData.items = 项目列表.filter((项目) => {
        if (!明确营销入口.has(项目?.key)) return true;
        删除数量 += 1;
        return false;
      });
    }
  }

  const 搜索内容 = 首页数据?.mainSearch?.bizData?.searchContents;
  if (Array.isArray(搜索内容)) {
    首页数据.mainSearch.bizData.searchContents = 搜索内容.filter((项目) => {
      const 文案 = (项目?.hintText || "") + " " + (项目?.keyword || "");
      if (!营销搜索词.test(文案)) return true;
      删除数量 += 1;
      return false;
    });
  }

  return 删除数量;
}

try {
  const 响应数据 = JSON.parse($response.body);
  const 页面数据 = 响应数据?.data?.data;
  const 删除数量 =
    清理专用广告接口(响应数据) +
    清理联盟商品推荐(响应数据) +
    清理弹窗广告(页面数据) +
    清理首页营销(页面数据);

  console.log("[菜鸟去广告] 本次共清理 " + 删除数量 + " 项广告或营销内容");
  $done({ body: JSON.stringify(响应数据) });
} catch (错误) {
  console.log("[菜鸟去广告] 响应解析失败，已保持原始内容：" + 错误);
  $done({});
}
