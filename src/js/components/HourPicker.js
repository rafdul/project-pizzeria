/*global rangeSlider*/

import BaseWidget from'./BaseWidget.js';
import {select, settings} from '../settings.js';
import {utils} from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input);

    // console.log(thisWidget.dom.input.value);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;

      // console.log(thisWidget.value);
    });
  }

  parseValue(value){
    // const thisWidget = this;
    // console.log(value);
    console.log(utils.numberToHour(value));
    return utils.numberToHour(value);
    // newValue to thisWidget.dom.input.value
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;
