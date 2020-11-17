/*global flatpickr*/

import BaseWidget from'./BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    // uruchomienie pluginu
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1, //czyli poniedziałek
      },
      disable: [
        function(date){
          return(date.getDay() === 1);
        }
      ],
      onChange: function(selectedDates, dateStr){
        thisWidget.value = dateStr;
        console.log(dateStr);
      }
    });
  }

  // domyślna metoda nie ma zastosowania, bo wartością pluginu nie będzie liczba
  // trzeba nadpisać, aby zwracała otrzymany argument, nie wykonując na nim żadnych operacji
  parseValue(value){
    // console.log(value);
    return value;
  }

  // nie ma zastosowania metoda domyślna w tym widgecie, więc zwraca po prostu true
  isValid(){
    return true;
  }

  // ta metoda domyślna też nie będzie potrzebna, więc wstawiam tam tylko konsolę
  renderValue(value){
    console.log(value);
  }
}

export default DatePicker;
