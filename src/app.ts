class DragAndDrop {
  templateElement: HTMLTemplateElement;
  baseElement: HTMLDivElement;
  element: HTMLFormElement;

 constructor() {
   this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
   this.baseElement = document.getElementById('app')! as HTMLDivElement;

   const importedNode = document.importNode(this.templateElement.content, true);
   this.element = importedNode.firstElementChild as HTMLFormElement;
   this.attach();
 } 

 private attach() {
   this.baseElement.insertAdjacentElement('afterbegin', this.element);
 }
}

const dropProject = new DragAndDrop();