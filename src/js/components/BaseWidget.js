class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  // dodanie gettera
  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  // zmodyfikowanie setValue do settera
  // metoda ustawiająca nową wartość widgetu
  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if(newValue !== thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;

      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  // żeby nie modyfikować składni AmountWidget można stworzyć przekierowanie czyli
  // metoda setValue wykorzystywała nowy sposób zapisu wartośći
  // (zostanie wykonany setter o ile nowa wartość value jest poprawna)
  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  // klasa BaseWidget powinna być samodzielna, czyli nie może korzystać z metod w innych klasach
  // więc trzeba do niej skopiować parseValue, isValid (i usuniemy warunki dla widgetu AmountWidget)
  // pareseValue pozwoli przekształcić wartość na odpowiedni typ lub format
  parseValue(value){
    return parseInt(value);
  }

  // będzie zwracać prawda lub fałsz w zależności od tego czy wartość value jest prawidłowa
  // !isNaN(value) --> sprawdza czy value nie jest nie-liczbą (not a number)
  isValid(value){
    return !isNaN(value);
  }

  // służy, aby bieżąca wartość widgetu została wyświetlona na stronie (wyrenderowana)
  // zmieniamy z input na wrapper, bo nadpisywany może być inny element niż input
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
