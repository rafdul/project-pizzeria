import {select, settings, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(containerOfBooking){
    const thisBooking = this;

    // const bookingElement = thisBooking.querySelector(select.containerOf.booking);

    thisBooking.selectedTable = null;

    thisBooking.render(containerOfBooking);
    thisBooking.initWidgets();
    thisBooking.getData();
  }


  // pobieranie danych z API
  getData(){
    const thisBooking = this;

    const stardDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        stardDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        stardDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('get Data urls', urls);

    // fetch(urls.booking)
    //   .then(function(bookingsResponse){
    //     return bookingsResponse.json();
    //   })
    //   .then(function(bookings){
    //     console.log(bookings);
    //   });

    // Metoda Promise.all zbiera funkcje fetch dla wielu argumentów i wykonuje je po kolei
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const bookingseventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          bookingseventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }


  // tworzy obiekt, w którym znajdzie się infomracja o zajętych stolikach
  // to ten obiekt będzie przeglądał skrypt sprawdzając, czy stolik w danym terminie jest wolny
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
          // funkcja utils tutaj konwertuje obiekt loopDate do tekstu w odpowiednim formacie (zamiast item.date)
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);
    // console.log(thisBooking.booked['2020-11-17']);
    // console.log(thisBooking.booked['2020-11-17']['16']);
    // console.log(thisBooking.booked['2020-11-17']['16'].includes(2));

    thisBooking.updateDOM();
  }


  // tworzy tablicę z rezerwacjami
  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
      // console.log(thisBooking.booked);
    }

    const startHour = utils.hourToNumber(hour);
    // console.log(startHour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock +=0.5){
      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
        // console.log(thisBooking.booked[date][startHour]);
      }

      thisBooking.booked[date][hourBlock].push(table);
      // console.log(thisBooking.booked[date][hourBlock] );
    }
  }

  // dodaje / usuwa klasy booked przy stolikach (na oznaczenie rezerwacji)
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    // sprawdzamy czy wszystkie stoliki są wolne
    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      // sprawdzamy czy tableId jest liczbą
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      // sprawdzamy, czy nie wszystkie stoliki są zajęte
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }


  // sprawdza dostępność stolików (vs godzina zamknięcia oraz vs już istniejące rezerwacje)
  checkTableAvailible(table, hour){
    const thisBooking = this;

    const startHour = utils.hourToNumber(thisBooking.hourPicker.value);

    if (startHour + hour > settings.hours.close) {
      alert('Restauracja pracuje tylko do godz. 24. Zmień termin rezerwacji');
      return false;
    } else {
      for (let hourBlock = startHour; hourBlock < startHour + hour; hourBlock += 0.5) {
        // console.log(thisBooking.booked[thisBooking.datePicker.value][hourBlock]);
        // console.log(thisBooking.booked[thisBooking.datePicker.value][hourBlock].includes(parseInt(table)));
        if(thisBooking.booked[thisBooking.datePicker.value][hourBlock] === undefined){
          return true;
        } else if(thisBooking.booked[thisBooking.datePicker.value][hourBlock].includes(parseInt(table))){
          console.log('parseInt', parseInt(table));
          alert('Wybrany stolik jest już zajęty. Zmień godziny rezerwacji');
          return false;
        }
      }
    }
    return true;
  }


  // wysyłanie rezerwacji do API
  sendBooking(){
    const thisBooking = this;
    // console.log('start sendBooking');

    // const startBooked = utils.hourToNumber(thisBooking.hourPicker.value);
    // const durationBooked = thisBooking.hoursAmount.value;
    // const tableBooked = thisBooking.selectedTable;

    // // Komunikat, jeśli stolik nie został wybrany
    // if(!thisBooking.selectedTable){
    //   alert('Proszę wybierz stolik');
    //   return;
    // }

    // // Komunikat, jeśli długość rezerwacji wykracza poza godzinę zamknięcia restauracji (g. 24)
    // if (startBooked + durationBooked > 24){
    //   alert ('Restauracja pracuje tylko do godz. 24. Zmień termin rezerwacji');
    //   return;
    // }

    // // Komunikat, jeśli rezerwacja koliduje z już istniejącą rezerwacją
    // for(let hourBlock = startBooked; hourBlock < startBooked + durationBooked; hourBlock +=0.5){
    //   console.log(hourBlock);
    //   // console.log(parseInt(thisBooking.selectedTable));
    //   console.log(thisBooking.booked[thisBooking.date][hourBlock].includes(parseInt(tableBooked)));
    //   if(thisBooking.booked[thisBooking.date][hourBlock].includes(parseInt(tableBooked)) == true){
    //     console.log(thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(tableBooked)));
    //     alert ('Wybrany stolik jest już zajęty. Zmień godziny rezerwacji');
    //     return;
    //   }
    // }

    // Komunikat, jeśli stolik nie został wybrany
    if(!thisBooking.selectedTable){
      alert('Proszę wybierz stolik');
      return;
    }

    // Komunikat, jeśli nr telefonu nie został podany
    if(!thisBooking.dom.phone.value){
      alert('Proszę podaj numer telefonu');
      return;
    }

    // Komunikat, jeśli email nie został podany
    if(!thisBooking.dom.address.value){
      alert('Proszę podaj adres email');
      return;
    }

    const url = settings.db.url + '/' + settings.db.booking;
    // console.log('url', url);

    const payload = {
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      table: parseInt(thisBooking.selectedTable),
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
    };

    console.log(payload);

    for(let starter of thisBooking.dom.starters){
      if(starter.checked == true){
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);

        thisBooking.updateDOM();
        console.log('parsedResponse', parsedResponse);
      });
  }


  render(containerOfBooking){
    const thisBooking = this;

    // generować kod HTML za pomocą szablonu templates.bookingWidget bez podawania mu jakiegokolwiek argumentu,
    const generatedHTML = templates.bookingWidget();

    // tworzyć pusty obiekt thisBooking.dom,
    thisBooking.dom = {};

    // zapisywać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi,
    thisBooking.dom.wrapper = containerOfBooking;

    // zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu,
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    // we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora select.booking.peopleAmount,
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    // analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    // thisBooking.dom.btnBookTable = thisBooking.dom.wrapper.querySelector('.order-confirmation button');
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    // console.log(thisBooking.dom.form);

    thisBooking.dom.datePickerInput = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.input);
    // thisBooking.dom.hourPickerInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisBooking.dom.hourPickerOutput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    // console.log('thisBooking.dom.datePickerInput', thisBooking.dom.datePickerInput);
    // console.log('thisBooking.dom.hourPickerInput', thisBooking.dom.hourPickerInput);
    // console.log('thisBooking.dom.hourPickerOutput', thisBooking.dom.hourPickerOutput);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }


  // uruchamia widgety z datą, godziną, stolikami, liczbą osob i liczbą godzin rezerwacji
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // console.log(thisBooking.peopleAmount);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('updated', function () {
      thisBooking.clearTable();
      // thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function () {
      thisBooking.clearTable();
      // thisBooking.updateDOM();
    });

    // sprawdzanie dostępności stolika podczas korzystania z hoursAmount
    thisBooking.dom.hoursAmount.addEventListener('updated', function (event) {
      event.preventDefault();
      // thisBooking.clearTable();
      console.log('thisBooking.selectedTable', thisBooking.selectedTable);
      console.log('thisBooking.hoursAmount.value', thisBooking.hoursAmount.value);

      if(!thisBooking.checkTableAvailible(thisBooking.selectedTable, thisBooking.hoursAmount.value)){
        thisBooking.clearTable();
        return;
      }

      // thisBooking.updateDOM();
    });

    // Wysyłka formularza rezerwacji (Book Table)
    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      // console.log(event);

      thisBooking.sendBooking();
    });

    // uruchamia sprawdzanie dostępności przy kliknięciu w stolik i nadanie mu klasy active
    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function (event) {
        event.preventDefault();

        if (table.classList.contains('booked')) {
          return;
        }

        if(!thisBooking.checkTableAvailible(table.dataset.table, thisBooking.hoursAmount.value)){
          return;
        }

        thisBooking.clearTable();
        table.classList.add('active');
        thisBooking.selectedTable = table.dataset.table;
      });
    }
  }

  // usuwa klasę active ze stolika
  clearTable() {
    const thisBooking = this;

    for(let table of thisBooking.dom.tables){
      if(thisBooking.selectedTable == table.dataset.table){
        table.classList.remove('active');
      }
    }

    thisBooking.selectedTable = null;
  }
}

export default Booking;
