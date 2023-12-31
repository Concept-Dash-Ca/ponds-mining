/** Website link used to mine -
 * Focus on the xmin, ymin and xmax, ymax values to get better results done manually
 * https://ws.lioservices.lrc.gov.on.ca/arcgis2/rest/services/Access_Environment/Access_Environment_Map/MapServer/1/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A-9312310.776108077%2C%22ymin%22%3A5164793.64181244%2C%22xmax%22%3A-8235985.081325935%2C%22ymax%22%3A5742160.212445513%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&outSR=102100
 * Website to download pdf - https://www.accessenvironment.ene.gov.on.ca/instruments/*.pdf
 */

const axios = require("axios");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const data = require("./data.json");

const pdfLink = "https://www.accessenvironment.ene.gov.on.ca/instruments/";

const log = (content, filePath) => {
  fs.appendFileSync(filePath, content, "utf-8");
};

const searchKeyword = (pdfData) => {
  const searchText = pdfData.text;
  return searchText.includes(" pond ") || searchText.includes(" Pond ");
};

const retrievePDF = async (pdfId) => {
  const response = await axios.get(pdfLink + pdfId, {
    responseType: "arraybuffer",
  });
  const pdfData = await pdfParse(new Uint8Array(response.data));

  return pdfData;
};

const checkProject = async (project) => {
  console.log(`Mining PDF - ${project["PDF_LINK"]}`);
  const result = JSON.parse(fs.readFileSync('./result.json', {encoding: "utf-8"}))
  try {
    const pdf = await retrievePDF(project["PDF_LINK"]);
    const isKeywordFound = searchKeyword(pdf);

    console.log(isKeywordFound ? "Keyword Found" : "Keyword Not Found")

    if (isKeywordFound) {
      result.push(project);
    }
  } catch (error) {
    log(
      `\nError Retrieving PDF_ID ${project["PDF_LINK"]}: ` + error,
      "./error.txt"
    );
  } finally {
    fs.writeFileSync("./result.json", JSON.stringify(result), {encoding: "utf-8"});
  }
};

const main = async () => {
  const projects = data.features;
  console.log(`Mining Started for ${projects.length} projects`);

  for (let i = 0; i < projects.length; i++) {
    if(projects[i].attributes.PDF_LINK !== null)
        await checkProject(projects[i].attributes);
  }
};

main();
