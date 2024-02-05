import { initViewer, loadModel } from './viewer.js';

let viewer;

initViewer(document.getElementById('preview')).then(v => {
    viewer = v;
    const urn = window.location.hash?.substring(1);
    setupModelSelection(viewer, urn);
    setupModelUpload(viewer);
});

export { viewer };

async function setupModelSelection(viewer, selectedUrn) {
    const dropdown = document.getElementById('models');
    dropdown.innerHTML = '';
    try {
        const resp = await fetch('/api/models');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();
        dropdown.innerHTML = models.map(model => `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`).join('\n');
        dropdown.onchange = () => onModelSelected(viewer, dropdown.value);
        if (dropdown.value) {
            onModelSelected(viewer, dropdown.value);
        }
    } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
    }
}

async function setupModelUpload(viewer) {
    const upload = document.getElementById('upload');
    const input = document.getElementById('input');
    const models = document.getElementById('models');
    upload.onclick = () => input.click();
    input.onchange = async () => {
        const file = input.files[0];
        let data = new FormData();
        data.append('model-file', file);
        if (file.name.endsWith('.zip')) { // When uploading a zip file, ask for the main design file in the archive
            const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
            data.append('model-zip-entrypoint', entrypoint);
        }
        upload.setAttribute('disabled', 'true');
        models.setAttribute('disabled', 'true');
        showNotification(`Uploading model <em>${file.name}</em>. Do not reload the page.`);
        try {
            const resp = await fetch('/api/models', { method: 'POST', body: data });
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            const model = await resp.json();
            setupModelSelection(viewer, model.urn);
        } catch (err) {
            alert(`Could not upload model ${file.name}. See the console for more details.`);
            console.error(err);
        } finally {
            clearNotification();
            upload.removeAttribute('disabled');
            models.removeAttribute('disabled');
            input.value = '';
        }
    };
}


export async function selectScannedElement(viewer, decodedText) {
    try {
        let idDict = await new Promise(resolve => {
            viewer.model.getExternalIdMapping(data => resolve(data));
        });
        let dynamicKey = decodedText;
        let objectID = idDict[dynamicKey];
        viewer.isolate(objectID);
        viewer.fitToView(objectID);

        // Select the scanned element
        let selectionName = Array();
        let selectionValue = Array();
        let selectionCategory = Array();

        // Select the scanned element
        viewer.select(objectID);
        viewer.getProperties(objectID, function (props) {
        // Show the native Autodesk property panel

            const propertyPanel = new Autodesk.Viewing.UI.PropertyPanel(viewer.container, 'PropertyPanel', 'Properties'); // This will show the property panel
            for (var i = 0; i < props.properties.length; i++) {
                propertyPanel.addProperty(props.properties[i].displayName, props.properties[i].displayValue, props.properties[i].displayCategory);
            }
            propertyPanel.setVisible(true);

            let referenceElement = document.getElementById('startButton');

            let button = document.createElement('button');
            button.textContent = 'Open Associated File';
            button.onclick = function(e) {
            // Open the file associated with the QR code in a new tab
                window.open(`/path/to/file/associated/with/${decodedText}`, '_blank');
            };
            referenceElement.parentNode.insertBefore(button, referenceElement);
        });
    } catch (err) {
        alert('Could not select element. See the console for more details.');
        console.error(err);
    }
}

async function onModelSelected(viewer, urn) {
    if (window.onModelSelectedTimeout) {
        clearTimeout(window.onModelSelectedTimeout);
        delete window.onModelSelectedTimeout;
    }
    window.location.hash = urn;
    try {
        const resp = await fetch(`/api/models/${urn}/status`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const status = await resp.json();
        switch (status.status) {
            case 'n/a':
                showNotification(`Model has not been translated.`);
                break;
            case 'inprogress':
                showNotification(`Model is being translated (${status.progress})...`);
                window.onModelSelectedTimeout = setTimeout(onModelSelected, 5000, viewer, urn);
                break;
            case 'failed':
                showNotification(`Translation failed. <ul>${status.messages.map(msg => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`);
                break;
            default:
                clearNotification();
                loadModel(viewer, urn);
                break; 
        }
    } catch (err) {
        alert('Could not load model. See the console for more details.');
        console.error(err);
    }
}

function showNotification(message) {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = `<div class="notification">${message}</div>`;
    overlay.style.display = 'flex';
}

function clearNotification() {
    const overlay = document.getElementById('overlay');
    overlay.innerHTML = '';
    overlay.style.display = 'none';
}
