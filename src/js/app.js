import {classNames, templates, settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

// deklaracja wykorzystywanych metod dla zmiennej app czyli obiektu,
// który pomoże w organizacji kodu aplikacji,
const app = {
  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data); // .data to odesłanie do pliku data.js
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    // wywołanie zapytania AJAX
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;

        // execute initMenu method
        /* metodę initMenu trzeba było przenieść do tego miejsca z samego końca, */
        /*  ponieważ w związku z asynchronicznością AJAX uruchamiałaby się */
        /*  zanim skrypt otrzymałby z serwera listę produktów */
        thisApp.initMenu();

        return parsedResponse;

      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));

  },

  // metoda inicjująca instację koszyka; przekazujemy jej wraper koszyka
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
  },
};

// wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony.
app.init();
