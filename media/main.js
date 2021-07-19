// @ts-nocheck

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {

    /* INIT */
    const vscode = acquireVsCodeApi();
    console.log = (x) => {
        vscode.postMessage({ type: 'log', x });
    }

    try {
        /* SELECTION UTIL */
        let elements = []
        
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
        }

        let deselectElements = (start, end) => {
            for (let i = start; i <= end; i++) {
                const element = elements[i];
                element.style.textDecoration = "none"
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
            generateRegex.style.visibility = "hidden"
            if (firstClickIndex !== -1) {
                elements[firstClickIndex].style.textDecoration = "none"
                elements[secondClickIndex].style.textDecoration = "none"
            }
            if (firstClickIndex === -1) {
                firstClickIndex = index
                secondClickIndex = index
            } else {
                if (firstClickIndex === index) {
                    deselectElements(firstClickIndex, secondClickIndex)
                    initClickIndexes()
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
                validateLabel.style.visibility = "visible"
                elements[firstClickIndex].style.textDecoration = "overline"
                elements[secondClickIndex].style.textDecoration = "overline"
            } else {
                validateLabel.style.visibility = "hidden"
            }
            selectElements(firstClickIndex, secondClickIndex)
        }
        

        /* INIT ELEMENTS */

        let initialColor
        const initElements = () => {
            elements = document.querySelectorAll('.character')
            elements.forEach((el, index) => {
                initialColor = elements[0].style.color
                el.addEventListener('click', () => {
                try {
                    updateClicksIndex(index)
                } catch (err) {
                    vscode.postMessage({ type: 'error', message: "Error : " + err });
                }
                })
            })
        }
        initElements()

        /* LISTENERS */

        let labels = {
            "white": "C",
            "orange": "V",
            "green": "O",
        }
        let commonLabelBtn = document.querySelector(".commonLabel")
        let variableLabelBtn = document.querySelector(".variableLabel")
        let optionalLabelBtn = document.querySelector(".optionalLabel")
        let currentLabel = "orange"
        variableLabelBtn.style.border = "solid 3px red"
        optionalLabelBtn.addEventListener("click", () => {
            currentLabel = "green"
            selectElements(firstClickIndex, secondClickIndex)
            commonLabelBtn.style.border = ""
            variableLabelBtn.style.border = ""
            optionalLabelBtn.style.border = "solid 3px red"
        })
        variableLabelBtn.addEventListener("click", () => {
            currentLabel = "orange"
            selectElements(firstClickIndex, secondClickIndex)
            commonLabelBtn.style.border = ""
            variableLabelBtn.style.border = "solid 3px red"
            optionalLabelBtn.style.border = ""
        })
        commonLabelBtn.addEventListener("click", () => {
            currentLabel = "white"
            selectElements(firstClickIndex, secondClickIndex)
            commonLabelBtn.style.border = "solid 3px red"
            variableLabelBtn.style.border = ""
            optionalLabelBtn.style.border = ""
        })

        let inputText = document.querySelector("input.validateText")
        const setInitialText = (text) => {
            vscode.postMessage({ type: 'setText', text: text });
            const parsedText = text.replace(/ /g, "˽")
            const spans = Array.from(parsedText).map((char, index) => `<span class='character' id="e${index}">${(char===" ") ? "˽" : char}</span>`).join(" ")
            document.querySelector(".initialText").innerHTML = spans
            initElements()
            document.querySelector(".title").innerHTML = "Text you are working on :"
            document.querySelector("button.validateText").textContent = "Update text"
            document.querySelector(".generationTools").style.visibility = "visible"
        }
        let validateText = document.querySelector("button.validateText")
        validateText.addEventListener("click", () => {
            if (validateText.textContent === "Update text") {
                document.querySelector(".title").innerHTML = "Please provide the text to work on :"
                document.querySelector(".initialText").innerHTML = `<input class="validateText" type="text"></input>`
                inputText = document.querySelector("input.validateText")
                document.querySelector("button.validateText").textContent = "Validate text"
                document.querySelector(".generationTools").style.visibility = "hidden"
                document.querySelector(".generateRegex").style.visibility = "inherit"
            } else {
                if (inputText.value.trim() !== "") {
                    setInitialText(inputText.value)
                } else {
                    inputText.value = ""
                }
            }
        })

        let resetLabels = document.querySelector(".resetLabel")
        resetLabels.addEventListener("click", () => {
            currentLabel = "white"
            if (firstClickIndex !== -1) {
                elements[firstClickIndex].style.textDecoration = "none"
                elements[secondClickIndex].style.textDecoration = "none"
            }
            selectElements(0, elements.length-1)
            initClickIndexes()
            generateRegex.style.visibility = "visible"
            validateLabel.style.visibility = "hidden"
            vscode.postMessage({ type: 'setLabel', startIndex: 0, endIndex: elements.length-1, label: labels[currentLabel] });
            currentLabel = "orange"
            commonLabelBtn.style.border = ""
            variableLabelBtn.style.border = "solid 3px red"
            optionalLabelBtn.style.border = ""
        })

        let generateRegex = document.querySelector(".generateRegex")
        generateRegex.addEventListener("click", () => {
            vscode.postMessage({ type: 'generate' });
        })

        const validateLabel = document.querySelector('.validateLabel')
        validateLabel.addEventListener('click', () => {
            try {
                if (firstClickIndex !== -1) {
                    vscode.postMessage({ type: 'setLabel', startIndex: firstClickIndex, endIndex: secondClickIndex, label: labels[currentLabel] });
                    elements[firstClickIndex].style.textDecoration = "none"
                    elements[secondClickIndex].style.textDecoration = "none"
                    initClickIndexes()
                    generateRegex.style.visibility = "visible"
                    validateLabel.style.visibility = "hidden"
                }
            } catch (err) {
                vscode.postMessage({ type: 'error', message: "Error : " + err });
            }
        });

        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.type) {
                case 'getSelectedText':
                    {
                        if (message.selectedText !== "") {
                            setInitialText(message.selectedText)
                        }
                        break;
                    }
                case 'generate':
                    {
                        document.querySelector(".generatedFindRegex").innerHTML = message.generatedRegex
                        break;
                    }
            }
        });
        vscode.postMessage({ type: 'getSelectedText' });
    } catch (err) {
        console.log("Error in js : " + err)
    }

}());


