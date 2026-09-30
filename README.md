# Quantumult X 菜鸟去广告

本项目基于菜鸟 iOS App 的真实 HAR 响应编写，不照搬旧脚本。

## V1 处理范围

- 清空首页弹窗广告列表 `adsShowDTOList`
- 清空弹窗接口返回的广告素材池
- 移除“包裹赚赚”和“欢乐赢红包”入口
- 移除正常功能入口旁的广告气泡
- 移除带“有奖、赚赚、赢红包”的搜索框营销文案

脚本不会修改包裹列表、物流详情、账号、寄件、取件、出库码、回收或积分接口。

## Quantumult X 使用方法

1. 打开 Quantumult X。
2. 进入“设置 → 重写 → 引用”。
3. 添加以下订阅地址：

   `https://raw.githubusercontent.com/JEFFRY-ZH/Cainiao-AdBlock/main/Cainiao.conf`

4. 启用引用，并关闭其他处理菜鸟相同接口的旧规则。
5. 确认 MitM 已开启，证书已安装并完全信任。
6. 完全退出菜鸟 App，重新打开后测试首页和弹窗。

## 当前接口

脚本只处理 HAR 中确认的接口：

`https://e2e-mtop.cainiao.com/gw/mtop.cainiao.app.e2e.engine.page.fetch/1.0`

MitM 仅包含 `e2e-mtop.cainiao.com`，不解密淘宝、支付宝或其他阿里域名。
