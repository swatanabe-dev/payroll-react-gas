function doGet() {
  return HtmlService.createHtmlOutputFromFile("src/index.html")
    .setTitle("Nexus Payroll (Demo)")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
