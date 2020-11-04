import {settings, select} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    // thisWidget.element.setAttribute('data-min', settings.amountWidget.defaultMin);
    // thisWidget.element.setAttribute('data-max', settings.amountWidget.defaultMax);
    // thisWidget.setValue(settings.amountWidget.defaultValue); //to rozwiązanie uniemożliwia poprawne działanie initAmountWidget w CartProduct
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    // console.log('AmountWidget:', thisWidget);
    // console.log('construkctor arguments:', element);

    // console.log(thisWidget.element);
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  // metoda ustawiająca nową wartość widgetu
  setValue(value){
    const thisWidget = this;
    // thisWidget.limitAmount();

    const newValue = parseInt(value);

    // const minLimit = thisWidget.element.getAttribute('data-min');
    // const maxLimit = thisWidget.element.getAttribute('data-max');
    // console.log(minLimit);
    // console.log(maxLimit);

    if(newValue !== thisWidget.input.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
    // if(newValue !== thisWidget.input.value && newValue >= minLimit && newValue <= maxLimit) {
      thisWidget.value = newValue;

      thisWidget.announce();
      // console.log(minLimit);
    }

    thisWidget.input.value = thisWidget.value;

    // inna metoda określenia limitów min i max dla wartości w widgecie
    // 1. w konstruktorze amountWidget dodaję do thisWidget.element nowe atrybuty data-min i data-max
    // 2. w metodzie setValue tworzę zmienne minLimit i maxLimit pobierające wartości tych atrybutów
    // 3. w warunku if wykorzystuje te dwie zmienne do określenia min i max dla wartości widgeta

  }

  // metoda aktywujące buttony + i - w widgecie
  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
      // console.log(event);
      // console.log(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
      // thisWidget.setValue(thisWidget.value -= 1 && thisWidget.value > settings.amountWidget.defaultMin);
      // console.log(event);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
      // thisWidget.setValue(thisWidget.value += 1 && thisWidget.value < settings.amountWidget.defaultMax);
    });
  }

  // metoda wywołująca customowy event wskazujący na konieczność zaktualizowania ceny produktu
  // metoda tworzy instancję klasy Event, wbudowanej w silnik JS (tj. w przeglądarkę)
  // następnie, ten event zostanie wywołany na kontenerze naszego widgetu.
  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
