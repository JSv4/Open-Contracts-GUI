// Just storing this code here for later to prepopulate doc description with first X chars of text
// Could also do this on the backend, but might as well leverage client machines to do it. 

//Approach 1: https://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input
// Realizing this is probably too old to be that useful (~6 years)
//Step 1: Get the file from the input element                
// inputElement.onchange = function(event) {

//     var file = event.target.files[0];

//     //Step 2: Read the file using file reader
//     var fileReader = new FileReader();  

//     fileReader.onload = function() {

//         //Step 4:turn array buffer into typed array
//         var typedarray = new Uint8Array(this.result);

//         //Step 5:PDFJS should be able to read this
//         PDFJS.getDocument(typedarray).then(function(pdf) {
//             // do stuff
//         });


//     };
//     //Step 3:Read the file as ArrayBuffer
//     fileReader.readAsArrayBuffer(file);

//  }

//  Approach 2 - Much more recent
//  https://stackoverflow.com/questions/40635979/how-to-correctly-extract-text-from-a-pdf-using-pdf-js
//  import PDFJS from "pdfjs-dist";
//  import PDFJSWorker from "pdfjs-dist/build/pdf.worker.js"; // add this to fit 2.3.0
 
//  PDFJS.disableTextLayer = true;
//  PDFJS.disableWorker = true; // not availaible anymore since 2.3.0 (see imports)
 
//  const getPageText = async (pdf: Pdf, pageNo: number) => {
//    const page = await pdf.getPage(pageNo);
//    const tokenizedText = await page.getTextContent();
//    const pageText = tokenizedText.items.map(token => token.str).join("");
//    return pageText;
//  };
 
//  /* see example of a PDFSource below */
//  export const getPDFText = async (source: PDFSource): Promise<string> => {
//    Object.assign(window, {pdfjsWorker: PDFJSWorker}); // added to fit 2.3.0
//    const pdf: Pdf = await PDFJS.getDocument(source).promise;
//    const maxPages = pdf.numPages;
//    const pageTextPromises = [];
//    for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
//      pageTextPromises.push(getPageText(pdf, pageNo));
//    }
//    const pageTexts = await Promise.all(pageTextPromises);
//    return pageTexts.join(" ");
//  };
 

//  file.arrayBuffer().then((ab: ArrayBuffer) => {
//     const pdfSource: PDFSource = Buffer.from(ab);
//   });