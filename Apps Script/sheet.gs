function fetchEmailList() {
    const apiUrl = "https://api.xiaozhi.moe/subscribers"; // 替換為您的 API 地址
    const apiKey = "API_Token"; // API 金鑰

    try {
        // 發送 GET 請求到 API
        const response = UrlFetchApp.fetch(apiUrl, {
            method: "get",
            contentType: "application/json",
            headers: {
                Authorization: apiKey // 將 API 金鑰附加到 Authorization 頭部
            }
        });

        // 將回應內容解析為 JSON
        const jsonData = JSON.parse(response.getContentText());

        if (!jsonData.subscribers || jsonData.subscribers.length === 0) {
            Logger.log("目前沒有訂閱者");
            return;
        }

        // 獲取當前活躍的表單和第一個工作表
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // 清空表格內容
        sheet.clear();

        // 設置表格標題
        sheet.appendRow(["Email Address"]);

        // 將每個訂閱者的電子郵件填充到表格
        jsonData.subscribers.forEach(email => {
            sheet.appendRow([email]);
        });

        Logger.log("成功更新訂閱者列表到 Google Sheet！");
    } catch (error) {
        Logger.log(`獲取電子郵件列表失敗: ${error.message}`);
    }
}