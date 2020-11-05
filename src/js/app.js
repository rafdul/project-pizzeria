import {classNames, templates, settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

// deklaracja wykorzystywanych metod dla zmiennej app czyli obiektu,
// który pomoże w organizacji kodu aplikacji,
const app = {
  // metoda przełączania podstron (bez przeładowywania strony)
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    console.log('idFromHash', idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    console.log('pageMatchingHash', pageMatchingHash);

    // uruchomienie metody aktywacji podstrony pierwszej (czyli o indeksie 0 w tablicy)
    // znalezionej w selektorze thisApp.pages; konieczne wydobycie id, bo w html tylko tym atrybutem są one różnicowane
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');

        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        // change URL hash (czyli końcówka URL po #)
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    // add class active to matching page, remove from non-matching
    for(let page of thisApp.pages){
      // if(page.id == pageId){
      //   page.classList.add(classNames.pages.activate);
      // } else {
      //   page.classList.remove(classNames.pages.activate);
      // }

      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    // add class active to matching links, remove from non-matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

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
    thisApp.initPages();
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
  },
};

// wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony.
app.init();
