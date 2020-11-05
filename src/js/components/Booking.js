import {select, templates} from '../settings.js';

class Booking{
  constructor(containerOfBooking){
    const thisBooking = this;

    // const bookingElement = thisBooking.querySelector(select.containerOf.booking);
    thisBooking.render(containerOfBooking);
    thisBooking.initWidget();
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
  }

  initWidget(){
    const thisBooking = this;
  }

}

export default Booking;
