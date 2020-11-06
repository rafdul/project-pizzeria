import {settings, select} from '../settings.js';
import BaseWidget from'./BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);
    // thisWidget.value = settings.amountWidget.defaultValue; // tym zajmuje się teraz BaseWidget
    // thisWidget.element.setAttribute('data-min', settings.amountWidget.defaultMin);
    // thisWidget.element.setAttribute('data-max', settings.amountWidget.defaultMax);
    // thisWidget.setValue(settings.amountWidget.defaultValue); //to rozwiązanie uniemożliwia poprawne działanie initAmountWidget w CartProduct
    // thisWidget.setValue(thisWidget.input.value); // tym zajmuje się teraz BaseWidget
    thisWidget.initActions();

    // console.log('AmountWidget:', thisWidget);
    // console.log('construkctor arguments:', element);

    // console.log(thisWidget.element);
  }

  getElements(/*element*/){
    const thisWidget = this;

    // thisWidget.element zamieniamy na thisWidget.dom.wrapper, bo jest to argument konstruktorze w funkcji BaseWidget
    // i jest przekazywany do konstruktora AmountWidget jako element
    // we właściwości wrapper thisWidget.dom zapisaliśmy wrapperAmount przekazywany do konstrukora AmountWidget
    // thisWidget.element = element; // tym zajmuje się teraz BaseWidget
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  // cała metoda przeniesiona do BaseWidget
  // metoda ustawiająca nową wartość widgetu
  // setValue(value){
  //   const thisWidget = this;
  //   // thisWidget.limitAmount();

  //   // przekształca tekst w liczbę (user na stronie wpisuje tekst, a Widget potrzbeuje liczby)
  //   // po dodaniu metody parseValue należy z niej skorzystać
  //   // const newValue = parseInt(value);
  //   const newValue = thisWidget.parseValue(value);

  //   // const minLimit = thisWidget.element.getAttribute('data-min');
  //   // const maxLimit = thisWidget.element.getAttribute('data-max');
  //   // console.log(minLimit);
  //   // console.log(maxLimit);

  //   // if(newValue !== thisWidget.dom.input.value && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax){
  //   if(newValue !== thisWidget.dom.input.value && thisWidget.isValid(newValue)) {
  //   // if(newValue !== thisWidget.input.value && newValue >= minLimit && newValue <= maxLimit) {
  //     thisWidget.value = newValue;

  //     thisWidget.announce();
  //     // console.log(minLimit);
  //   }

  //   // thisWidget.dom.input.value = thisWidget.value;
  //   thisWidget.renderValue();

  //   // inna metoda określenia limitów min i max dla wartości w widgecie
  //   // 1. w konstruktorze amountWidget dodaję do thisWidget.element nowe atrybuty data-min i data-max
  //   // 2. w metodzie setValue tworzę zmienne minLimit i maxLimit pobierające wartości tych atrybutów
  //   // 3. w warunku if wykorzystuje te dwie zmienne do określenia min i max dla wartości widgeta
  // }

  // dodatkowe metody pozwalające setValue działać, w innych sytuacjach niż wybór liczby z okreslonego przedziału (jako powyżej)
  // pareseValue pozwoli przekształcić wartość na odpowiedni typ lub format
  // po przeniesieniu do BAseWidget tu można ją usunąć
  // parseValue(value){
  //   return parseInt(value);
  // }

  // będzie zwracać prawda lub fałsz w zależności od tego czy wartość value jest prawidłowa
  // w zależności od kryteriów ustawionych dla danego widgetu
  // !isNaN(value) --> sprawdza czy value nie jest nie-liczbą (not a number)
  isValid(value){
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin
    && value <= settings.amountWidget.defaultMax;
  }

  // służy, aby bieżąca wartość widgetu została wyświetlona na stronie (wyrenderowana)
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  // metoda aktywujące buttony + i - w widgecie
  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      // thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
      // console.log(event);
      // console.log(thisWidget.dom.input.value);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
      // thisWidget.setValue(thisWidget.value -= 1 && thisWidget.value > settings.amountWidget.defaultMin);
      // console.log(event);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
      // thisWidget.setValue(thisWidget.value += 1 && thisWidget.value < settings.amountWidget.defaultMax);
    });
  }

  // metoda przeniesiona do BaseWidget
  // metoda wywołująca customowy event wskazujący na konieczność zaktualizowania ceny produktu
  // metoda tworzy instancję klasy Event, wbudowanej w silnik JS (tj. w przeglądarkę)
  // następnie, ten event zostanie wywołany na kontenerze naszego widgetu.
  // announce(){
  //   const thisWidget = this;

  //   const event = new CustomEvent('updated', {
  //     bubbles: true
  //   });
  //   thisWidget.dom.wrapper.dispatchEvent(event);
  // }
}

export default AmountWidget;
