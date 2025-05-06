// src/storage.test.ts
import { Form, FormResponse, TextField, RadioField } from './interfaces';
import * as Storage from './storage'; // Import all exports

// Mock localStorage (if not using jest.setup.js)
/*
if (typeof window !== 'undefined' && !global.localStorage) {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();
  Object.defineProperty(global, 'localStorage', { value: localStorageMock });
}
*/
// Note: Using jest.setup.js is cleaner than putting the mock here.

const FORMS_STORAGE_KEY = 'googleFormsClone_Forms';
const RESPONSES_STORAGE_KEY = 'googleFormsClone_Responses';

// Sample Data for Testing
const sampleForm1: Form = {
    id: 'form1',
    title: 'Sample Survey',
    fields: [
        { id: 'f1', type: 'text', label: 'Your Name', required: true } as TextField,
        {
            id: 'f2',
            type: 'radio',
            label: 'Your Choice',
            options: [
                { id: 'o1', value: 'a', label: 'Option A' },
                { id: 'o2', value: 'b', label: 'Option B' },
            ],
        } as RadioField,
    ],
};

const sampleForm2: Form = {
    id: 'form2',
    title: 'Feedback Form',
    fields: [{ id: 'f3', type: 'text', label: 'Comments' } as TextField],
};

const sampleResponse1: FormResponse = {
    id: 'resp1',
    formId: 'form1',
    submittedAt: Date.now() - 10000,
    responses: { f1: 'Test User', f2: 'a' }
};

const sampleResponse2: FormResponse = {
    id: 'resp2',
    formId: 'form2',
    submittedAt: Date.now() - 5000,
    responses: { f3: 'Good work' }
};

const sampleResponse3: FormResponse = {
    id: 'resp3',
    formId: 'form1',
    submittedAt: Date.now(),
    responses: { f1: 'Another User', f2: 'b' }
};

describe('Storage Functions', () => {
    // Clear localStorage before each test (redundant if using setup file, but safe)
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks(); // Clear mock function calls
    });

    // Restore any spies after each test to avoid interference
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('generateId', () => {
        it('should return a string', () => {
            expect(typeof Storage.generateId()).toBe('string');
        });

        it('should return different IDs on subsequent calls', () => {
            const id1 = Storage.generateId();
            const id2 = Storage.generateId();
            expect(id1).not.toBe(id2);
        });
    });

    // --- Form Storage ---
    describe('Form Storage (loadForms, saveForms, getFormById)', () => {
        it('loadForms should return an empty array if localStorage is empty', () => {
            expect(Storage.loadForms()).toEqual([]);
        });

        it('saveForms should store forms in localStorage', () => {
            const setItemSpy = jest.spyOn(localStorage, 'setItem');
            const formsToSave = [sampleForm1];
            Storage.saveForms(formsToSave);
            // Check if localStorage.setItem was called correctly
            expect(setItemSpy).toHaveBeenCalledWith(
                FORMS_STORAGE_KEY,
                JSON.stringify(formsToSave)
            );
        });

        it('loadForms should retrieve saved forms correctly', () => {
            const formsToSave = [sampleForm1, sampleForm2];
            localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(formsToSave)); // Pre-populate localStorage
            const loadedForms = Storage.loadForms();
            expect(loadedForms).toEqual(formsToSave);
        });

        it('loadForms should return empty array on JSON parse error and log error', () => {
            // Spy on console.error before setting invalid data
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            localStorage.setItem(FORMS_STORAGE_KEY, 'invalid json data');
            expect(Storage.loadForms()).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled(); // Check if error was logged
            consoleSpy.mockRestore(); // Clean up the spy
        });

        it('getFormById should find an existing form', () => {
            const forms = [sampleForm1, sampleForm2];
            expect(Storage.getFormById('form1', forms)).toEqual(sampleForm1);
            expect(Storage.getFormById('form2', forms)).toEqual(sampleForm2);
        });

        it('getFormById should return undefined for a non-existent form ID', () => {
            const forms = [sampleForm1, sampleForm2];
            expect(Storage.getFormById('nonexistent', forms)).toBeUndefined();
        });

        it('getFormById should return undefined when searching in an empty array', () => {
            expect(Storage.getFormById('form1', [])).toBeUndefined();
        });
    });

    // --- Response Storage ---
    describe('Response Storage (loadResponses, saveResponses, getResponsesByFormId)', () => {
        it('loadResponses should return an empty array if localStorage is empty', () => {
            expect(Storage.loadResponses()).toEqual([]);
        });

        it('saveResponses should store responses in localStorage', () => {
            const setItemSpy = jest.spyOn(localStorage, 'setItem');
            const responsesToSave = [sampleResponse1];
            Storage.saveResponses(responsesToSave);
            expect(setItemSpy).toHaveBeenCalledWith(
                RESPONSES_STORAGE_KEY,
                JSON.stringify(responsesToSave)
            );
        });

        it('loadResponses should retrieve saved responses correctly', () => {
            const responsesToSave = [sampleResponse1, sampleResponse2, sampleResponse3];
            localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(responsesToSave));
            const loadedResponses = Storage.loadResponses();
            expect(loadedResponses).toEqual(responsesToSave);
        });

        it('loadResponses should return empty array on JSON parse error and log error', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            localStorage.setItem(RESPONSES_STORAGE_KEY, '{"bad json"}');
            expect(Storage.loadResponses()).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('getResponsesByFormId should filter responses for a specific form', () => {
            const allResponses = [sampleResponse1, sampleResponse2, sampleResponse3];
            const form1Responses = Storage.getResponsesByFormId('form1', allResponses);
            expect(form1Responses).toEqual([sampleResponse1, sampleResponse3]);
            expect(form1Responses.length).toBe(2);
        });

        it('getResponsesByFormId should return an empty array if no responses match', () => {
            const allResponses = [sampleResponse1, sampleResponse2, sampleResponse3];
            const form3Responses = Storage.getResponsesByFormId('form3', allResponses);
            expect(form3Responses).toEqual([]);
        });

        it('getResponsesByFormId should return an empty array if searching in empty responses', () => {
            const form1Responses = Storage.getResponsesByFormId('form1', []);
            expect(form1Responses).toEqual([]);
        });
    });
});
