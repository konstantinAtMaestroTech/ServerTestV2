import { initViewer, loadModel } from './viewer.js';

let viewer;

initViewer(document.getElementById('preview')).then(v => {
    viewer = v;
    const urn = window.location.hash?.substring(1);
    myModelInititialization(viewer);
});

export { viewer };

async function myModelInititialization(viewer) {
    try {
        const resp = await fetch('/api/models');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();
        const modelUrn = String(models.map(model => model.urn));
        console.log('Model URN is ' + modelUrn);
        console.log('Model URN type is ' + typeof modelUrn);
        if (modelUrn) {
            onModelSelected(viewer, modelUrn);
        }
    } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
    }
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
                viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (x) =>  {
                
                    let explodeExtension = viewer.getExtension('Autodesk.Explode');
                    let orbitExtension = viewer.getExtension('Autodesk.Viewing.FusionOrbit');
                    let navTools = viewer.getExtension('Autodesk.DefaultTools.NavTools');
                    let bimWalk = viewer.getExtension('Autodesk.BimWalk');
                    /* let sectionExtension = viewer.getExtension('Autodesk.Section'); */
                    let propertiesPanel = viewer.getExtension('Autodesk.PropertiesManager');
                    let modelStructure = viewer.getExtension('Autodesk.ModelStructure');
                    let viewCube = viewer.getExtension('Autodesk.ViewCubeUi');
                    let documentBrowser = viewer.getExtension('Autodesk.DocumentBrowser');
    
                    
                    orbitExtension.unload();
                    explodeExtension.unload();
                    navTools.unload();
                    bimWalk.unload();
                    /* sectionExtension.unload(); */
                    propertiesPanel.unload();
                    modelStructure.unload();
                    viewCube.unload();
                    documentBrowser.unload();
    
                    let settingsTools = viewer.toolbar.getControl('settingsTools');
                    let modelTools = viewer.toolbar.getControl('modelTools');
                    
                    settingsTools.removeControl('toolbar-settingsTool');
                    settingsTools.removeControl('toolbar-fullscreenTool');
                    modelTools.removeControl('toolbar-sectionTool');
                });
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
