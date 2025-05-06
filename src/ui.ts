import { Form, AnyFormField, FormResponse, FormFieldOption, FieldType } from './interfaces';
import { generateId } from './storage';

const DOMElements = {
    formListContainer: () => document.getElementById('form-list-container')!,
    formBuilderContainer: () => document.getElementById('form-builder-container')!,
    formViewerContainer: () => document.getElementById('form-viewer-container')!,
    responseViewerContainer: () => document.getElementById('response-viewer-container')!,
    appContainer: () => document.getElementById('app')!,
};

interface UIActions {
    navigateToFormBuilder: (formId?: string) => void;
    navigateToFormViewer: (formId: string) => void;
    navigateToResponseViewer: (formId: string) => void;
    deleteForm: (formId: string) => void;
    saveForm: (form: Form) => void;
    submitResponse: (formId: string, responseData: { [fieldId: string]: string | string[] }) => void;
    goHome: () => void;
}
let actions: UIActions;

export function initializeUI(uiActions: UIActions): void {
    actions = uiActions;
}

/** Hides all main content sections */
function hideAllSections(): void {
    DOMElements.formListContainer().style.display = 'none';
    DOMElements.formBuilderContainer().style.display = 'none';
    DOMElements.formViewerContainer().style.display = 'none';
    DOMElements.responseViewerContainer().style.display = 'none';
}

/** Shows a specific content section */
function showSection(section: HTMLElement): void {
    hideAllSections();
    section.style.display = 'block';
    section.innerHTML = ''; // Clear previous content
}

/**
 * Renders the list of existing forms.
 * @param forms Array of forms to display.
 */
export function renderFormList(forms: Form[]): void {
    const container = DOMElements.formListContainer();
    showSection(container);

    const heading = document.createElement('h2');
    heading.textContent = 'My Forms';
    container.appendChild(heading);

    const createButton = document.createElement('button');
    createButton.textContent = 'Create New Form';
    createButton.className = 'button primary';
    createButton.onclick = () => actions.navigateToFormBuilder(); // Navigate to builder for a new form
    container.appendChild(createButton);

    if (forms.length === 0) {
        const noFormsMessage = document.createElement('p');
        noFormsMessage.textContent = 'No forms created yet.';
        container.appendChild(noFormsMessage);
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'form-list';
    forms.forEach(form => {
        const li = document.createElement('li');
        li.className = 'form-list-item';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = form.title || 'Untitled Form';
        li.appendChild(titleSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'form-actions';

        const viewButton = document.createElement('button');
        viewButton.textContent = 'View/Fill';
        viewButton.className = 'button secondary';
        viewButton.onclick = () => actions.navigateToFormViewer(form.id);
        actionsDiv.appendChild(viewButton);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'button secondary';
        editButton.onclick = () => actions.navigateToFormBuilder(form.id); // Navigate to builder for existing form
        actionsDiv.appendChild(editButton);

        const responsesButton = document.createElement('button');
        responsesButton.textContent = 'Responses';
        responsesButton.className = 'button secondary';
        responsesButton.onclick = () => actions.navigateToResponseViewer(form.id);
        actionsDiv.appendChild(responsesButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'button danger';
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent triggering other clicks if nested
            if (confirm(`Are you sure you want to delete the form "${form.title || 'Untitled Form'}"?`)) {
                actions.deleteForm(form.id);
            }
        };
        actionsDiv.appendChild(deleteButton);

        li.appendChild(actionsDiv);
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

/**
 * Renders the form builder interface for creating or editing a form.
 * @param form The form object to edit, or a new empty form structure if creating.
 */
export function renderFormBuilder(form: Form): void {
    const container = DOMElements.formBuilderContainer();
    showSection(container);

    const header = document.createElement('div');
    header.className = 'form-builder-header';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Form Title';
    titleInput.value = form.title;
    titleInput.className = 'form-title-input';
    titleInput.oninput = () => {
        form.title = titleInput.value; // Update form title in memory as user types
    };
    header.appendChild(titleInput);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Form';
    saveButton.className = 'button primary';
    saveButton.onclick = () => actions.saveForm(form); // Trigger save action
    header.appendChild(saveButton);

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to List';
    backButton.className = 'button secondary';
    backButton.onclick = () => actions.goHome();
    header.appendChild(backButton);

    container.appendChild(header);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.id = 'fields-builder-area'; // ID for easy targeting
    container.appendChild(fieldsContainer);

    const rerenderFields = () => {
        fieldsContainer.innerHTML = ''; // Clear current fields
        form.fields.forEach((field, index) => {
            const fieldElement = createFieldEditorElement(field, form, index, rerenderFields);
            fieldsContainer.appendChild(fieldElement);
        });
    };

    rerenderFields();

    const addFieldControls = document.createElement('div');
    addFieldControls.className = 'add-field-controls';

    const selectFieldType = document.createElement('select');
    selectFieldType.innerHTML = `
        <option value="text">Text Input</option>
        <option value="radio">Multiple Choice (Radio)</option>
        <option value="checkbox">Checkboxes</option>
    `;
    addFieldControls.appendChild(selectFieldType);

    const addFieldButton = document.createElement('button');
    addFieldButton.textContent = 'Add Field';
    addFieldButton.className = 'button primary';
    addFieldButton.onclick = () => {
        const newFieldType = selectFieldType.value as FieldType;
        let newField: AnyFormField;
        const newFieldId = generateId();

        // Create a new field object based on the selected type
        switch (newFieldType) {
            case 'radio':
                newField = {
                    id: newFieldId,
                    type: 'radio',
                    label: 'New Question (Radio)',
                    options: [{ id: generateId(), value: 'option1', label: 'Option 1' }] // Start with one option
                };
                break;
            case 'checkbox':
                newField = {
                    id: newFieldId,
                    type: 'checkbox',
                    label: 'New Question (Checkbox)',
                    options: [{ id: generateId(), value: 'option1', label: 'Option 1' }]
                };
                break;
            case 'text':
            default:
                newField = {
                    id: newFieldId,
                    type: 'text',
                    label: 'New Question (Text)'
                };
                break;
        }
        form.fields.push(newField);
        rerenderFields();
    };
    addFieldControls.appendChild(addFieldButton);
    container.appendChild(addFieldControls);
}

/**
 * Creates the DOM element for editing a single form field within the builder.
 * @param field The field data.
 * @param form The parent form object (needed for removing/reordering).
 * @param index The current index of the field in the form's fields array.
 * @param rerenderFields Callback function to re-render the fields list after changes.
 * @returns The HTMLElement for the field editor.
 */
function createFieldEditorElement(field: AnyFormField, form: Form, index: number, rerenderFields: () => void): HTMLElement {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'field-editor';
    fieldDiv.dataset.fieldId = field.id; // Store field ID for reference

    // --- Field Header (Label Input & Delete Button) ---
    const fieldHeader = document.createElement('div');
    fieldHeader.className = 'field-editor-header';

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Question Label';
    labelInput.value = field.label;
    labelInput.className = 'field-label-input';
    labelInput.oninput = () => {
        field.label = labelInput.value;
    };
    fieldHeader.appendChild(labelInput);

    // Optional: Required Checkbox
    const requiredLabel = document.createElement('label');
    requiredLabel.textContent = ' Required';
    requiredLabel.style.marginLeft = '10px';
    const requiredCheckbox = document.createElement('input');
    requiredCheckbox.type = 'checkbox';
    requiredCheckbox.checked = field.required ?? false;
    requiredCheckbox.onchange = () => {
        field.required = requiredCheckbox.checked;
    };
    requiredLabel.prepend(requiredCheckbox);
    fieldHeader.appendChild(requiredLabel);


    const deleteFieldButton = document.createElement('button');
    deleteFieldButton.textContent = 'Delete Field';
    deleteFieldButton.className = 'button danger small';
    deleteFieldButton.onclick = () => {
        if (confirm(`Delete field "${field.label || 'this field'}"?`)) {
            form.fields.splice(index, 1); // Remove field from array
            rerenderFields(); // Re-render the list
        }
    };
    fieldHeader.appendChild(deleteFieldButton);
    fieldDiv.appendChild(fieldHeader);

    if (field.type === 'radio' || field.type === 'checkbox') {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'field-options-editor';

        field.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-editor-item';

            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.value = option.label;
            optionInput.placeholder = `Option ${optionIndex + 1}`;
            optionInput.oninput = () => {
                option.label = optionInput.value;
                option.value = optionInput.value.toLowerCase().replace(/\s+/g, '-');
            };
            optionDiv.appendChild(optionInput);

            const deleteOptionButton = document.createElement('button');
            deleteOptionButton.textContent = 'X';
            deleteOptionButton.className = 'button danger small';
            deleteOptionButton.title = 'Delete Option';
            deleteOptionButton.onclick = () => {
                if (field.options.length > 1) { // Prevent deleting the last option
                    field.options.splice(optionIndex, 1);
                    rerenderFields(); // Re-render needed to update options list
                } else {
                    alert("Cannot delete the last option.");
                }
            };
            optionDiv.appendChild(deleteOptionButton);
            optionsContainer.appendChild(optionDiv);
        });

        // Button to add a new option
        const addOptionButton = document.createElement('button');
        addOptionButton.textContent = 'Add Option';
        addOptionButton.className = 'button secondary small add-option-button';
        addOptionButton.onclick = () => {
            const newOptionId = generateId();
            const newOptionLabel = `Option ${field.options.length + 1}`;
            field.options.push({
                id: newOptionId,
                label: newOptionLabel,
                value: newOptionLabel.toLowerCase().replace(/\s+/g, '-') // Generate simple value
            });
            rerenderFields(); // Re-render to show the new option input
        };
        optionsContainer.appendChild(addOptionButton);

        fieldDiv.appendChild(optionsContainer);
    }

    return fieldDiv;
}


/**
 * Renders the form viewer ("preview" or "fill-out" mode).
 * @param form The form structure to display.
 * @param existingResponses Optional: Used if displaying responses, not needed for filling.
 */
export function renderFormViewer(form: Form): void {
    const container = DOMElements.formViewerContainer();
    showSection(container);

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'form-viewer-header';

    const formTitle = document.createElement('h2');
    formTitle.textContent = form.title || 'Untitled Form';
    header.appendChild(formTitle);

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to List';
    backButton.className = 'button secondary';
    backButton.onclick = () => actions.goHome();
    header.appendChild(backButton);

    container.appendChild(header);

    // Use a <form> element for semantic correctness and potential native validation
    const formElement = document.createElement('form');
    formElement.id = `form-${form.id}`;
    formElement.onsubmit = (event) => {
        event.preventDefault(); // Prevent default browser form submission
        handleSubmit(form, formElement);
    };
    container.appendChild(formElement);


    // --- Render Fields ---
    if (form.fields.length === 0) {
        const noFieldsMessage = document.createElement('p');
        noFieldsMessage.textContent = 'This form has no questions yet.';
        formElement.appendChild(noFieldsMessage);
    } else {
        form.fields.forEach(field => {
            const fieldElement = createFieldViewerElement(field);
            formElement.appendChild(fieldElement);
        });

        // --- Submit Button ---
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Response';
        submitButton.className = 'button primary';
        formElement.appendChild(submitButton);
    }
}

/**
 * Creates the DOM element for displaying and interacting with a single form field in the viewer.
 * @param field The field data.
 * @returns The HTMLElement for the field viewer.
 */
function createFieldViewerElement(field: AnyFormField): HTMLElement {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'form-field-view';
    fieldDiv.dataset.fieldId = field.id;

    const label = document.createElement('label');
    label.textContent = field.label;
    label.htmlFor = `field-${field.id}`; // Associate label with the first input if possible
    if (field.required) {
        const requiredSpan = document.createElement('span');
        requiredSpan.textContent = ' *';
        requiredSpan.style.color = 'red';
        label.appendChild(requiredSpan);
    }
    fieldDiv.appendChild(label);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    switch (field.type) {
        case 'text':
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = `field-${field.id}`;
            textInput.name = field.id; // Use field ID as name
            textInput.required = field.required ?? false;
            textInput.placeholder = 'Your answer';
            inputContainer.appendChild(textInput);
            break;

        case 'radio':
            // Radio buttons need the same 'name' attribute within the group
            field.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'form-option';

                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = field.id;
                radioInput.id = `field-${field.id}-option-${option.id}`;
                radioInput.value = option.value;
                radioInput.required = field.required ?? false;

                const optionLabel = document.createElement('label');
                optionLabel.textContent = option.label;
                optionLabel.htmlFor = radioInput.id;

                optionDiv.appendChild(radioInput);
                optionDiv.appendChild(optionLabel);
                inputContainer.appendChild(optionDiv);
            });
            break;

        case 'checkbox':
            field.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'form-option';

                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox';
                checkboxInput.name = field.id;
                checkboxInput.id = `field-${field.id}-option-${option.id}`;
                checkboxInput.value = option.value;

                if (field.required) {
                    checkboxInput.dataset.requiredGroup = 'true';
                }


                const optionLabel = document.createElement('label');
                optionLabel.textContent = option.label;
                optionLabel.htmlFor = checkboxInput.id;

                optionDiv.appendChild(checkboxInput);
                optionDiv.appendChild(optionLabel);
                inputContainer.appendChild(optionDiv);
            });

            if (field.required) {
                const hiddenValidation = document.createElement('input');
                hiddenValidation.type = 'text';
                hiddenValidation.required = true;
                hiddenValidation.style.display = 'none';
                hiddenValidation.dataset.checkboxGroup = field.id;
                inputContainer.appendChild(hiddenValidation);
            }
            break;
    }

    fieldDiv.appendChild(inputContainer);
    return fieldDiv;
}

/**
 * Handles the form submission process within the form viewer.
 * Collects data, performs basic validation, and calls the submit action.
 * @param form The form structure being submitted.
 * @param formElement The HTML <form> element containing the inputs.
 */
function handleSubmit(form: Form, formElement: HTMLFormElement): void {
    const formData = new FormData(formElement);
    const responseData: { [fieldId: string]: string | string[] } = {};
    let isValid = true; // Flag for validation status

    form.fields.forEach(field => {
        const fieldId = field.id;

        if (field.type === 'checkbox') {
            // Get all selected values for this checkbox group
            const selectedValues = formData.getAll(fieldId) as string[];
            responseData[fieldId] = selectedValues;

            // Basic "at least one required" validation for checkboxes
            if (field.required && selectedValues.length === 0) {
                isValid = false;
                // Find the field element and add an error class/message
                const fieldElement = formElement.querySelector(`.form-field-view[data-field-id="${fieldId}"]`);
                if (fieldElement) {
                    fieldElement.classList.add('error');
                    // Remove previous error messages first
                    const existingError = fieldElement.querySelector('.error-message');
                    if (existingError) existingError.remove();
                    // Add new error message
                    const errorMsg = document.createElement('p');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'At least one option must be selected.';
                    errorMsg.style.color = 'red';
                    fieldElement.appendChild(errorMsg);
                }
            } else {
                // Clear error if valid
                const fieldElement = formElement.querySelector(`.form-field-view[data-field-id="${fieldId}"]`);
                if (fieldElement) {
                    fieldElement.classList.remove('error');
                    const existingError = fieldElement.querySelector('.error-message');
                    if (existingError) existingError.remove();
                }
            }
        } else {
            // For text and radio, get single value
            const value = formData.get(fieldId) as string | null;
            responseData[fieldId] = value ?? ''; // Store empty string if null

            // Basic 'required' validation using HTML5 validation API check
            const inputElement = formElement.querySelector(`[name="${fieldId}"]`) as HTMLInputElement | null;
            if (inputElement && !inputElement.checkValidity()) {
                isValid = false;
                const fieldElement = formElement.querySelector(`.form-field-view[data-field-id="${fieldId}"]`);
                if (fieldElement) {
                    fieldElement.classList.add('error');
                    const existingError = fieldElement.querySelector('.error-message');
                    if (existingError) existingError.remove();
                    const errorMsg = document.createElement('p');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = inputElement.validationMessage || 'This field is required.';
                    errorMsg.style.color = 'red';
                    fieldElement.appendChild(errorMsg);
                }
            } else {
                // Clear error if valid
                const fieldElement = formElement.querySelector(`.form-field-view[data-field-id="${fieldId}"]`);
                if (fieldElement) {
                    fieldElement.classList.remove('error');
                    const existingError = fieldElement.querySelector('.error-message');
                    if (existingError) existingError.remove();
                }
            }
        }
    });

    // Check overall form validity before submitting
    // formElement.checkValidity() checks native HTML5 validation
    if (isValid && formElement.checkValidity()) {
        console.log('Form Data Collected:', responseData);
        actions.submitResponse(form.id, responseData);
        alert('Response submitted successfully!');
        actions.goHome(); // Go back to the list after submission
    } else {
        console.error('Form validation failed.');
        alert('Please fill out all required fields correctly.');
        // Errors are displayed next to the fields
    }
}


/**
 * Renders the view for displaying submitted responses for a specific form.
 * @param form The form structure (needed for question labels).
 * @param responses The list of responses submitted for this form.
 */
export function renderResponseViewer(form: Form, responses: FormResponse[]): void {
    const container = DOMElements.responseViewerContainer();
    showSection(container);

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'response-viewer-header';

    const title = document.createElement('h2');
    title.textContent = `Responses for "${form.title || 'Untitled Form'}"`;
    header.appendChild(title);

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to List';
    backButton.className = 'button secondary';
    backButton.onclick = () => actions.goHome();
    header.appendChild(backButton);

    container.appendChild(header);

    // --- Summary ---
    const summary = document.createElement('p');
    summary.textContent = `Total Responses: ${responses.length}`;
    container.appendChild(summary);

    if (responses.length === 0) {
        const noResponseMessage = document.createElement('p');
        noResponseMessage.textContent = 'No responses have been submitted for this form yet.';
        container.appendChild(noResponseMessage);
        return;
    }

    // --- Responses List ---
    const responsesList = document.createElement('div');
    responsesList.className = 'responses-list';

    responses.forEach((response, index) => {
        const responseCard = document.createElement('div');
        responseCard.className = 'response-card';

        const responseHeader = document.createElement('h4');
        const submissionDate = new Date(response.submittedAt).toLocaleString();
        responseHeader.textContent = `Response #${index + 1} (Submitted: ${submissionDate})`;
        responseCard.appendChild(responseHeader);

        const answersList = document.createElement('ul');
        answersList.className = 'response-answers';

        // Iterate through the *form fields* to ensure order and display all questions
        form.fields.forEach(field => {
            const answerItem = document.createElement('li');
            const questionLabel = document.createElement('strong');
            questionLabel.textContent = `${field.label}: `;
            answerItem.appendChild(questionLabel);

            const answerValue = response.responses[field.id];
            const answerSpan = document.createElement('span');

            if (answerValue === undefined || answerValue === null || answerValue === '') {
                answerSpan.textContent = '- (No answer provided)';
                answerSpan.style.fontStyle = 'italic';
            } else if (Array.isArray(answerValue)) {
                // Handle checkbox array
                answerSpan.textContent = answerValue.join(', ') || '-';
            } else {
                // Handle text or radio string
                answerSpan.textContent = answerValue;
            }
            answerItem.appendChild(answerSpan);
            answersList.appendChild(answerItem);
        });

        responseCard.appendChild(answersList);
        responsesList.appendChild(responseCard);
    });

    container.appendChild(responsesList);
}
