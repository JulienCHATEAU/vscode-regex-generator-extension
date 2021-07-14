//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();
    console.log = (x) => {
        vscode.postMessage({ type: 'log', x });
    }
    
    let initialColor
    let labels = {
        "white": "C",
        "orange": "V",
        "green": "O",
    }
    let commonLabelBtn = document.querySelector(".commonLabel")
    let variableLabelBtn = document.querySelector(".variableLabel")
    let optionalLabelBtn = document.querySelector(".optionalLabel")
    let currentLabel = "orange"
    // @ts-ignore
    variableLabelBtn.style.border = "solid 3px red"
    optionalLabelBtn.addEventListener("click", () => {
        currentLabel = "green"
        selectElements(firstClickIndex, secondClickIndex)
        // @ts-ignore
        commonLabelBtn.style.border = ""
        // @ts-ignore
        variableLabelBtn.style.border = ""
        // @ts-ignore
        optionalLabelBtn.style.border = "solid 3px red"
    })
    variableLabelBtn.addEventListener("click", () => {
        currentLabel = "orange"
        selectElements(firstClickIndex, secondClickIndex)
        // @ts-ignore
        commonLabelBtn.style.border = ""
        // @ts-ignore
        variableLabelBtn.style.border = "solid 3px red"
        // @ts-ignore
        optionalLabelBtn.style.border = ""
    })
    commonLabelBtn.addEventListener("click", () => {
        currentLabel = "white"
        selectElements(firstClickIndex, secondClickIndex)
        // @ts-ignore
        commonLabelBtn.style.border = "solid 3px red"
        // @ts-ignore
        variableLabelBtn.style.border = ""
        // @ts-ignore
        optionalLabelBtn.style.border = ""
    })

    
    let elements = document.querySelectorAll('.character')
    let resetLabels = document.querySelector(".resetLabel")
    resetLabels.addEventListener("click", () => {
        currentLabel = "white"
        if (firstClickIndex !== -1) {
            // @ts-ignore
            elements[firstClickIndex].style.textDecoration = "none"
            // @ts-ignore
            elements[secondClickIndex].style.textDecoration = "none"
        }
        selectElements(0, elements.length-1)
        // @ts-ignore
        commonLabelBtn.style.border = "solid 3px red"
        // @ts-ignore
        variableLabelBtn.style.border = ""
        // @ts-ignore
        optionalLabelBtn.style.border = ""
        initClickIndexes()
        // @ts-ignore
        generateRegex.style.visibility = "visible"
        vscode.postMessage({ type: 'setLabel', startIndex: 0, endIndex: elements.length-1, label: labels[currentLabel] });
    })

    let generateRegex = document.querySelector(".generateRegex")
    generateRegex.addEventListener("click", () => {
        vscode.postMessage({ type: 'generate' });
    })

    
    // @ts-ignore
    let initialFontWeigth = elements[0].style.fontWeight
    
    let selectElements = (start, end) => {
        for (let i = start; i <= end; i++) {
            if (start === -1) {
                return
            }
            const element = elements[i];
            selectElement(element)
        }
    }

    let selectElement = (element) => {
        element.style.color = currentLabel
        if (currentLabel !== "white") {
            element.style.fontWeight = "900"
        } else {
            element.style.fontWeight = initialFontWeigth
        }
    }

    // @ts-ignore
    let deselectElements = (start, end) => {
        for (let i = start; i <= end; i++) {
            const element = elements[i];
            // @ts-ignore
            element.style.textDecoration = "none"
            // @ts-ignore
            element.style.fontWeight = initialFontWeigth
            // @ts-ignore
            element.style.color = initialColor;
        }
    }

    let firstClickIndex = -1
    let secondClickIndex = -1

    let initClickIndexes = () => {
        firstClickIndex = -1
        secondClickIndex = -1
    }
    
    let updateClicksIndex = (index) => {
        console.log(index)
        // @ts-ignore
        generateRegex.style.visibility = "hidden"
        if (firstClickIndex !== -1) {
            // @ts-ignore
            elements[firstClickIndex].style.textDecoration = "none"
            // @ts-ignore
            elements[secondClickIndex].style.textDecoration = "none"
        }
        if (firstClickIndex === -1) {
            firstClickIndex = index
            secondClickIndex = index
        } else {
            if (firstClickIndex === index) {
                deselectElements(firstClickIndex, secondClickIndex)
                initClickIndexes()
                // @ts-ignore
                generateRegex.style.visibility = "visible"
            } else if (secondClickIndex === index) {
                deselectElements(firstClickIndex + 1, secondClickIndex)
                secondClickIndex = firstClickIndex
            } else if (firstClickIndex < index) {
                if (index < secondClickIndex) {
                    deselectElements(index, secondClickIndex)
                }
                secondClickIndex = index
            } else if (index < firstClickIndex) {
                firstClickIndex = index
            }
        }
        if (firstClickIndex !== -1) {
            // @ts-ignore
            elements[firstClickIndex].style.textDecoration = "underline"
            // @ts-ignore
            elements[secondClickIndex].style.textDecoration = "underline"
        }
        selectElements(firstClickIndex, secondClickIndex)
    }

    elements.forEach((el, index) => {
      // @ts-ignore
      initialColor = elements[0].style.color
      el.addEventListener('click', () => {
        try {
            updateClicksIndex(index)
        } catch (err) {
            vscode.postMessage({ type: 'error', message: "Error : " + err });
        }
      })
    })

    document.querySelector('.validateLabel').addEventListener('click', () => {
        try {
            vscode.postMessage({ type: 'setLabel', startIndex: firstClickIndex, endIndex: secondClickIndex, label: labels[currentLabel] });
            // @ts-ignore
            elements[firstClickIndex].style.textDecoration = "none"
            // @ts-ignore
            elements[secondClickIndex].style.textDecoration = "none"
            initClickIndexes()
            // @ts-ignore
            generateRegex.style.visibility = "visible"
        } catch (err) {
            vscode.postMessage({ type: 'error', message: "Error : " + err });
        }
    });

}());


