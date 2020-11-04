import {classNames, templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import {utils} from '../utils.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product:', thisProduct);
  }

  // metoda renderInMenu odpowiada za pojawienie się produktów na stronie (odwołuje się do data.js)
  renderInMenu(){
    const thisProduct = this;

    /*generate HTML based on template*/
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /*create element using utils.createElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);

    /*add element to menu*/
    menuContainer.appendChild(thisProduct.element);
  }

  // metoda getElements służy odnalezieniu elementów HTML w kontenerze produktu
  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    // /* do resetowania produktu po dodaniu do koszyka*/
    // thisProduct.defaultParamsOptions = thisProduct.form.querySelectorAll('input[checked], option[selected]');
    // console.log(thisProduct.form.querySelectorAll('input[checked], option[selected]'));
    // console.log(thisProduct.form.querySelectorAll('input[defaultChecked], option[defaultSelected]'));
    // console.log(thisProduct.form.querySelectorAll('input[value]'));
    // console.log(thisProduct.form.querySelectorAll('input[defaultValue]'));

    // console.log(thisProduct.form.querySelectorAll('input:checked'));
    // console.log(thisProduct.form.querySelectorAll('option[selected]'));


    // console.log('formInputs',thisProduct.formInputs);
    // console.log('priceElement', amountWidgetElem);
    // console.log('imageWrapper',thisProduct.imageWrapper);
  }

  // metoda initAccordion pozwala wyświetlać składniki tylko jednego produktu (resztę zwija)
  initAccordion(){
    const thisProduct = this;
    // console.log('this 1', this);

    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;

    /* START: click event listener to trigger */
    trigger.addEventListener('click', function (event){
      // console.log('clicked - listener in accordion');

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      /* find all active products */
      const activeProducts = document.querySelectorAll('.product.active');

      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts){

        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element){

          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          // console.log('this 2', this);

        /* END: if the active product isn't the element of thisProduct */
        }
      /* END LOOP: for each active product */
      }
    /* END: click event listener to trigger */
    });
  }

  // initOrderForm dodaje listenery eventów do formularza, jego kontrolek,
  // oraz guzika dodania do koszyka; uruchamiana tylko raz dla każdego produktu
  initOrderForm(){
    const thisProduct = this;
    // console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();

      // thisProduct.defaultProduct();

    });

  }

  // processOrder to metoda obliczająca cenę produktu
  processOrder(){
    const thisProduct = this;
    // console.log('processOrder');

    // remove class active from images
    const classImages = thisProduct.imageWrapper.querySelectorAll('img');
    for(let classImage of classImages){
      if (classImage.classList.lenght >=2){
        classImage.classList.remove(classNames.menuProduct.imageVisible);
      }
    }

    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    thisProduct.params = {};
    // set variable price to equal thisProduct.data.price
    let price = thisProduct.data.price;
    // console.log('price', price);

    //LOOP 1 stworzymy pętlę, która iteruje po wszystkich elementach params
    for (let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      // console.log('params', thisProduct.data.params);
      // console.log('paramId',paramId);

      // LOOP 2 iterująca po wszystkich opcjach danego parametru
      for (let optionId in param.options){
        // console.log('options', param.options);
        const option = param.options[optionId];
        // console.log('optionId', optionId);

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        // jeśli jest zaznaczona opcja, która nie jest domyślna, cena produktu musi się zwiększyć o cenę tej opcji,
        if(optionSelected && !option.default){
          price += option.price;
        // jeśli nie jest zaznaczona opcja, która jest domyślna, cena produktu musi się zmniejszyć o cenę tej opcji.
        } else if(!optionSelected && option.default){
          price -= option.price;
        }

        // Modyfikacja obrazków obok produktów
        // stworzenie stałej, w której zapiszesz wyszukane elementy,
        const visibleImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        // console.log('visibleImages',visibleImages);

        for (let image of visibleImages) {
          if(optionSelected){
            image.classList.add(classNames.menuProduct.imageVisible);
            // console.log('active image', image);
          } else {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

        if(optionSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
        }

        // Sposób opisany w skrypcie
        // // blok if/else, którego warunek sprawdza tylko, czy opcja została zaznaczona,
        // if (optionSelected){
        //   if(!thisProduct.params[paramId]){
        //     thisProduct.params[paramId] = {
        //       label: param.label,
        //       options: {},
        //     };
        //   }
        //   thisProduct.params[paramId].options[optionId] = option.label;
        // // wewnątrz bloku if musi znaleźć się pętla iterująca po znalezionych elementach
        //   for (let image of visibleImages) {
        //     image.classList.add(classNames.menuProduct.imageVisible);
        //     console.log('active image', image);
        //     // dodać odpowiednią klasę
        //   }
        // } else {
        //   // wewnątrz bloku else musi znaleźć się pętla iterująca po znalezionych elementach
        //   for (let image of visibleImages) {
        //   // usunąć odpowiednią klasę
        //     image.classList.remove(classNames.menuProduct.imageVisible);
        //   }
        // }
        // END LOOP 2
      }
    // END LOOP 1
    }
    // multiply price by amount
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    //  set the contents of thisProduct.priceElem to be the value of variable price
    thisProduct.priceElem.innerHTML = thisProduct.price;
    // console.log('end price', price);
    // console.log('thisProduct.params',thisProduct.params);
  }

  // initAmountWidget tworzy instancję klasy AmountWidget i zapisywała ją we właściwości produktu
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    // nasłuchiwanie eventu ('updated') stworzonego w metodzie announce i uruchamianie
    // metody processOrder, obliczającej cenę produktu
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  // metoda dodawania produktu do koszyka
  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value ;

    // app.cart.add(thisProduct);
    // console.log(thisProduct);

    // w podejściu modułowym import app.cart.add nie jest dobrym pomysłem
    // dlatego lepiej stworzyć event costomowy, który będzie bąbelkował do rodziców
    // i który będzie zawierał informację pod kluczem product o thisProduct
    // wywołanie tego elementu poprzez dispatchEvent i wskazanie elementu, na którym wywołujemy
    // ten event musi być też nasłuchiwany w initCart (plik app.js)
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }

  /* do resetowania produktu po dodaniu do koszyka*/
  /* START*/
  /*defaultProduct(){
    const thisProduct = this;
    console.log(this);
    // console.log(thisProduct.data.params);

    thisProduct.element.querySelector(select.widgets.amount.input).value = settings.amountWidget.defaultValue;

    thisProduct.priceElem.innerHTML = thisProduct.priceSingle;

    // było tab = thisProduct.defaultParamsOptions;
    // zmieniam na tab = thisProduct.formInputs

    const tab = thisProduct.defaultParamsOptions;
    console.log(tab);
    const array = Array.from(thisProduct.defaultParamsOptions)
    console.log(array);

    for (let el of array){
      console.log(el);
      console.log(array.indexOf(el));
      console.log(array[array.indexOf(el)].checked);
      console.log(array[array.indexOf(el)].defaultChecked);

      array[array.indexOf(el)].checked = 'true';
      array[array.indexOf(el)].selected = 'true';


      if(array[array.indexOf(el)].defaultChecked == 'false'){
        array[array.indexOf(el)].checked = 'false';
        array[array.indexOf(el)].selected = 'false';
      };
      // } else {
      //   array[array.indexOf(el)].checked = 'false';
      //   array[array.indexOf(el)].selected = 'false';
      // };
    }
    // STOP

    // // działą
    // let domyslne = thisProduct.defaultParamsOptions[0].checked;
    // console.log(domyslne);
    // thisProduct.defaultParamsOptions[0].checked = 'true';
    // console.log(domyslne);
    // console.log(thisProduct.defaultParamsOptions[0]);
    // console.log(thisProduct.defaultParamsOptions[0].checked);
    // console.log(thisProduct.defaultParamsOptions[0].defaultChecked);



    // for(let param in thisProduct.data.params){
    //   for(let option in thisProduct.data.params[param].options){
    //     const productDefault = thisProduct.data.params[param].options[option].default;
    //     // console.log(thisProduct.formInputs);
    //     console.log(productDefault);
    //     // console.log(productDefault.hasAttribute('checked'));
    //     // productDefault.element.setAttribute('input:checked', 'true');
    //     // console.log(thisProduct.data.params[param].options[option]);

    //     // return thisProduct.formInputs;
    //   }
    // }

    // thisProduct.processOrder();
    // thisProduct.params[paramId].options[optionId]

    // const result = app.data;
    // console.log(result);

  }*/
}

export default Product;
