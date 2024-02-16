function reverseObject(originalObject) {
    return Object.keys(originalObject).reduce((reversedObject, key) => {
      reversedObject[originalObject[key]] = key;
      return reversedObject;
    }, {});
}

export class ExplorePanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        this.container.style.height = (options.height || 400) + 'px';
        this.container.style.resize = 'none';
        console.log(this.container);
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        console.log(this.container);
        this.container.style.backgroundColor = 'white';
        this.closeButton = this.createCloseButton();
        this.container.appendChild(this.closeButton);

        // Show the associated labels

        // Create a labelPlaceHolder

        this.labelPlaceholder = document.createElement('img');
        this.labelPlaceholder.id = 'labelPlaceholder';

        this.labelPlaceholder.style.width = '100%';
        this.labelPlaceholder.style.height = '33.33%';
        this.labelPlaceholder.src = 'data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

        this.labelPlaceholder.style.position = 'relative';

        this.container.appendChild(this.labelPlaceholder);
        console.log(this.labelPlaceholder);

        //Create a text prompt

        this.textPrompt = document.createElement('p');
        this.textPrompt.textContent = 'Select an object to see its label';
        this.textPrompt.style.fontSize = '15px';
        this.textPrompt.style.color = 'black';
        this.textPrompt.style.position = 'absolute';
        this.textPrompt.style.top = '30%';
        this.textPrompt.style.left = '50%';
        this.textPrompt.style.transform = 'translate(-50%, -50%)';
        this.textPrompt.style.display = 'inline';

        this.container.appendChild(this.textPrompt);
        console.log(this.textPrompt);

        // Show the associated group checkbox

        this.checkbox = document.createElement('input');
        this.checkbox.type = 'checkbox';
        this.checkbox.id = 'colormodelExploreGroup';
        this.checkbox.style.width = (this.options.checkboxWidth || 30) + 'px';
        this.checkbox.style.height = (this.options.checkboxHeight || 28) + 'px';
        this.checkbox.style.position = 'absolute';
        this.checkbox.style.top = '47%';
        this.checkbox.style.left = '26%';
        this.checkbox.style.backgroundColor = (this.options.backgroundColor || 'white');
        this.checkbox.style.borderRadius = (this.options.borderRadius || 8) + 'px';
        this.checkbox.style.borderStyle = (this.options.borderStyle || 'groove');
        console.log(this.checkbox);

        this.checkbox.onchange = this.handleElementsColorsCheckerGroups.bind(this);
        this.container.appendChild(this.checkbox);

        // Show the associated group label

        this.checkboxLabel = document.createElement('label');
        this.checkboxLabel.innerHTML = 'Show Group';

        this.checkboxLabel.style.fontSize = '20px';
        this.checkboxLabel.style.color = 'black';
        this.checkboxLabel.style.position = 'absolute';
        this.checkboxLabel.style.top = this.checkbox.style.top;
        this.checkboxLabel.style.left = this.checkbox.style.left;
        this.checkboxLabel.style.transform = 'translate(-110%, 0%)';

        this.container.appendChild(this.checkboxLabel);


        // Show the associated zone checkbox

        this.checkboxZone = document.createElement('input');
        this.checkboxZone.type = 'checkbox';
        this.checkboxZone.id = 'colormodelExploreZone';
        this.checkboxZone.style.width = (this.options.checkboxWidth || 30) + 'px';
        this.checkboxZone.style.height = (this.options.checkboxHeight || 28) + 'px';
        this.checkboxZone.style.position = 'absolute';
        this.checkboxZone.style.top = '47%';
        this.checkboxZone.style.left = '59%';
        this.checkboxZone.style.backgroundColor = (this.options.backgroundColor || 'white');
        this.checkboxZone.style.borderRadius = (this.options.borderRadius || 8) + 'px';
        this.checkboxZone.style.borderStyle = (this.options.borderStyle || 'groove');

        this.checkboxZone.onchange = this.handleElementsColorsCheckerZones.bind(this);
        this.container.appendChild(this.checkboxZone);

        // Show the associated zone label

        this.checkboxLabelZone = document.createElement('labelZone');
        this.checkboxLabelZone.innerHTML = 'Show Zone';

        this.checkboxLabelZone.style.fontSize = '20px';
        this.checkboxLabelZone.style.color = 'black';
        this.checkboxLabelZone.style.position = 'absolute';
        this.checkboxLabelZone.style.top = this.checkboxZone.style.top;
        this.checkboxLabelZone.style.left = this.checkboxZone.style.left;
        this.checkboxLabelZone.style.transform = 'translate(-110%, 0%)';

        this.container.appendChild(this.checkboxLabelZone);

        // Show the associated time checkbox

        this.checkboxTime = document.createElement('input');
        this.checkboxTime.type = 'checkbox';
        this.checkboxTime.id = 'colormodelExploreTime';
        this.checkboxTime.style.width = (this.options.checkboxWidth || 30) + 'px';
        this.checkboxTime.style.height = (this.options.checkboxHeight || 28) + 'px';
        this.checkboxTime.style.position = 'absolute';
        this.checkboxTime.style.top = '47%';
        this.checkboxTime.style.left = '93%';
        this.checkboxTime.style.backgroundColor = (this.options.backgroundColor || 'white');
        this.checkboxTime.style.borderRadius = (this.options.borderRadius || 8) + 'px';
        this.checkboxTime.style.borderStyle = (this.options.borderStyle || 'groove');

        this.container.appendChild(this.checkboxTime);

        // Show the associated time label

        this.checkboxLabelTime = document.createElement('labelTime');
        this.checkboxLabelTime.innerHTML = 'Show Time';
        this.checkboxLabelTime.style.whiteSpace = 'nowrap';

        this.checkboxLabelTime.style.fontSize = '20px';
        this.checkboxLabelTime.style.color = 'black';
        this.checkboxLabelTime.style.position = 'absolute';
        this.checkboxLabelTime.style.top = this.checkboxTime.style.top;
        this.checkboxLabelTime.style.left = this.checkboxTime.style.left;
        this.checkboxLabelTime.style.transform = 'translate(-110%, 0%)';

        this.container.appendChild(this.checkboxLabelTime);

        // Drawings button

        this.drawingsButton = document.createElement('button');
        this.drawingsButton.id = 'drawingsButton';
        this.drawingsButton.innerHTML = 'Drawings';

        this.drawingsButton.style.position = 'absolute';
        this.drawingsButton.style.width = '46%';
        this.drawingsButton.style.height = '38%';
        this.drawingsButton.style.top = '57%';
        this.drawingsButton.style.left = '1%';
        console.log(this.drawingsButton);

        this.container.appendChild(this.drawingsButton);

        // Instructions button

        this.instructionsButton = document.createElement('button');
        this.instructionsButton.id = 'instructionsButton';
        this.instructionsButton.innerHTML = 'Instructions';

        this.instructionsButton.style.position = 'absolute';
        this.instructionsButton.style.width = '46%';
        this.instructionsButton.style.height = '38%';
        this.instructionsButton.style.top = '57%';
        this.instructionsButton.style.right = '1%';
        console.log(this.drawingsButton);

        this.container.appendChild(this.instructionsButton);
        



    }

    handleElementsColorsGroups() {
        const overrideCheckbox = document.getElementById('colormodelExploreGroup');
        var viewer = this.extension.viewer
        if (overrideCheckbox.checked) {
            viewer.clearThemingColors();
            let currentSelection = this.extension.viewer.getSelection();
            viewer.model.getBulkProperties(currentSelection, { propFilter: ['Maestro_RGB', 'Maestro_Group'] }, function (props) {
                let selectionGroup = props[0].properties[1].displayValue;
                let selectionRGB = props[0].properties[0].displayValue;
                let colorsInt = selectionRGB.replaceAll(' ', '').split(',').map(colorString => parseInt(colorString, 10));
                let colorVector4 = new THREE.Vector4(colorsInt[0] / 255, colorsInt[1] / 255, colorsInt[2] / 255, 0.5);
                viewer.search(selectionGroup, function (dbIds) {
                    viewer.model.getBulkProperties(dbIds, { propFilter: ['Maestro_Group'] }, function (el) {
                        for (let index = 0; index < el.length; index++) {
                            if (el[index].properties[0].displayValue === selectionGroup) {
                                viewer.setThemingColor(el[index].dbId, colorVector4);
                            }
                        }
                    });
                });
            });
        }
        else {
            viewer.clearThemingColors();
        }
    }

    handleElementsColorsZones() {
        const overrideCheckbox = document.getElementById('colormodelExploreZone');
        var viewer = this.extension.viewer
        if (overrideCheckbox.checked) {
            viewer.clearThemingColors();
            let currentSelection = this.extension.viewer.getSelection();
            viewer.model.getBulkProperties(currentSelection, { propFilter: ['Maestro_RGB', 'Maestro_Zone'] }, function (props) {
                let selectionZone = props[0].properties[1].displayValue;
                let green = new THREE.Vector4(0, 1, 0, 1); // RGB values are between 0 and 1, alpha is 1
                viewer.search(selectionZone, function (dbIds) {
                    console.log('Found dbIds', dbIds);
                    viewer.model.getBulkProperties(dbIds, { propFilter: ['Maestro_Zone'] }, function (el) {
                        for (let index = 0; index < el.length; index++) {
                            if (el[index].properties[0].displayValue === selectionZone) {
                                console.log('Found zone', el[index].dbId);
                                viewer.setThemingColor(el[index].dbId, green);
                            }
                        }
                    });
                });
            });
        }
        else {
            viewer.clearThemingColors();
        }
    }

    handleElementsColorsCheckerGroups() {
        const overrideCheckbox = document.getElementById('colormodelExploreGroup');
        const overrideCheckboxZones = document.getElementById('colormodelExploreZone');
        if (overrideCheckbox.checked) {
            this.handleElementsColorsGroups();
            overrideCheckboxZones.checked = false;
        }
        else {
            this.extension.viewer.clearThemingColors();
        }
    }

    handleElementsColorsCheckerZones() {
        const overrideCheckbox = document.getElementById('colormodelExploreZone');
        const overrideCheckboxGroups = document.getElementById('colormodelExploreGroup');
        if (overrideCheckbox.checked) {
            this.handleElementsColorsZones();
            overrideCheckboxGroups.checked = false;
        }
        else {
            this.extension.viewer.clearThemingColors();
        }
    }

    uploadLabels() {
        const labelPlaceholder = document.getElementById('labelPlaceholder');
        let currentSelection = this.extension.viewer.getSelection();
        if (currentSelection.length > 0) {
            let externalIdMapping;
            this.textPrompt.style.display = 'none';
            this.extension.viewer.model.getExternalIdMapping(function (data) {
                externalIdMapping = data;
                let reversedDict = reverseObject(externalIdMapping);
                let foundKey = reversedDict[currentSelection[0]];
                console.log('Found key', foundKey);
                let imageUrl = `/docs/Saviola/LabelsApp/${foundKey}.png`;
                fetch(imageUrl)
                    .then(response => labelPlaceholder.src = imageUrl)
                    .catch(error => console.error('Error:', error)); 
            });
        } else {
            this.textPrompt.style.display = 'inline';
            this.labelPlaceholder.src = 'data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        }
    }

    uploadDrawings() {
        const drawingsButton = document.getElementById('drawingsButton');
        let currentSelection = this.extension.viewer.getSelection();
        if (currentSelection.length > 0) {
            let externalIdMapping;
            this.extension.viewer.model.getExternalIdMapping(function (data) { // Same as above
                externalIdMapping = data;
                let reversedDict = reverseObject(externalIdMapping);
                let foundKey = reversedDict[currentSelection[0]];
                console.log('Found key', foundKey);
                let imageUrl = `/docs/Saviola/Drawings/${foundKey}.png`;
                fetch(imageUrl)
                    .then(response => drawingsButton.onclick = function() {
                        window.open(imageUrl, '_blank');
                    } )
                    .catch(error => console.error('Error:', error)); 
            });
        } else {
            this.drawingsButton.onclick = function() {alert('No object selected')};
        }
    }

    uploadInstructions () {
        const drawingsButton = document.getElementById('instructionsButton');
        let currentSelection = this.extension.viewer.getSelection();
        if (currentSelection.length > 0) {
            let externalIdMapping;
            this.extension.viewer.model.getExternalIdMapping(function (data) { // Same as above
                externalIdMapping = data;
                let reversedDict = reverseObject(externalIdMapping);
                let foundKey = reversedDict[currentSelection[0]];
                console.log('Found key', foundKey);
                let imageUrl = `/docs/Saviola/Instructions/${foundKey}.png`;
                fetch(imageUrl)
                    .then(response => drawingsButton.onclick = function() {
                        window.open(imageUrl, '_blank');
                    } )
                    .catch(error => console.error('Error:', error)); 
            });
        } else {
            this.drawingsButton.onclick = function() {alert('No object selected')};
        }
    }

}