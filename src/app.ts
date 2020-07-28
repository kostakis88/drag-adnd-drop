// Project State Management

class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {

  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  public addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  public addProject(title: string, description: string, numOfPeople: number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numOfPeople
    };
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number,
  required?: boolean,
  minLength?: number,
  maxLength?: number,
  min?: number,
  max?: number
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// Autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  baseElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.baseElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = []; 
 
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    for (const projItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = projItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private attach() {
    this.baseElement.insertAdjacentElement('beforeend', this.element);
  }
}

class DragAndDrop {
  templateElement: HTMLTemplateElement;
  baseElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

 constructor() {
   this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
   this.baseElement = document.getElementById('app')! as HTMLDivElement; 

   const importedNode = document.importNode(this.templateElement.content, true);
   this.element = importedNode.firstElementChild as HTMLFormElement;
   this.element.id = 'user-input';
   this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
   this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
   this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

   this.configure();
   this.attach();
 } 

 private gatherUserInputs(): [string, string, number] | void {
   const enteredTitle = this.titleInputElement.value;
   const enteredDescription = this.descriptionInputElement.value;
   const enteredPeople = this.peopleInputElement.value;

   const titleValidatable: Validatable = {
     value: enteredTitle,
     required: true
   };

   const descriptionValidatable: Validatable = {
     value: enteredDescription,
     required: true,
     minLength: 5,
     maxLength: 25
   }

   const peopleValidatable: Validatable = {
     value: parseFloat(enteredPeople),
     required: true,
     min: 1,
     max: 5
   }

   if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
     alert('Ivalid inputs please try again!');
     return;
   } else {
     return [enteredTitle, enteredDescription, parseFloat(enteredPeople)];
   }
 }

 private clearInputs() {
   this.titleInputElement.value = '';
   this.descriptionInputElement.value = '';
   this.peopleInputElement.value = '';
 }

 @Autobind
 private submitHandler(event: Event) {
   event.preventDefault();
   const userInputs = this.gatherUserInputs();
   if (Array.isArray(userInputs)) {
    const [title, desc, people] = userInputs;
    projectState.addProject(title, desc, people);
    this.clearInputs();
   }
 }

 private configure() {
   this.element.addEventListener('submit', this.submitHandler);
 }

 private attach() {
   this.baseElement.insertAdjacentElement('afterbegin', this.element);
 }
}

const dropProject = new DragAndDrop();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');