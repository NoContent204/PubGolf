export function showModal(id: string, toShow: boolean){
  const addPlayerModal = document.getElementById(id);
  if (toShow) {
    addPlayerModal?.classList.remove('hidden')
  } else {
    addPlayerModal?.classList.add('hidden') 
  }
  const parentForm =  addPlayerModal?.children[0]
  
  if (parentForm?.tagName === "FORM" ) {
    (parentForm as HTMLFormElement).reset()
  }
}