import { selectScannedElement } from './main.js';
import { viewer } from './main.js';

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: { width: 250, height: 250 } });

document.getElementById('startButton').addEventListener('click', function() {
    $('#myModal').modal('show');
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});

function onScanSuccess(decodedText, decodedResult) {
    // Handle the scanned code as you like, for example:
    console.log(`QR Code detected: ${decodedText}`);

    selectScannedElement(viewer, decodedText);
    
    html5QrcodeScanner.clear().then(() => {
        // Scanner stopped, close the modal
        $('#myModal').modal('hide');
    }).catch((error) => {
        // Failed to stop the scanner, handle error
        console.log(`QR Code stop error: ${error}`);
    });
}
    
function onScanFailure(error) {
    // You can choose to ignore failures, as they may be due to the QR code
    // not being in the frame, or other reasons like light conditions.
    console.log(`QR Code scan error: ${error}`);
}