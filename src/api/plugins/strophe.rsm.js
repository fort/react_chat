// http://xmpp.org/extensions/xep-0059.html
import {Strophe, $build} from 'strophe.js';

export default function pluginStropheRSM () {

  Strophe.addNamespace('RSM', 'http://jabber.org/protocol/rsm');

  Strophe.RSM = function(options) {
    this.attribs = ['max', 'first', 'last', 'after', 'before', 'index', 'count'];

    if (typeof options.xml != 'undefined') {
      this.fromXMLElement(options.xml);
    } else {
      for (let ii = 0; ii < this.attribs.length; ii++) {
        let attrib = this.attribs[ii];
        this[attrib] = options[attrib];
      }
    }
  };

  Strophe.RSM.prototype = {
    toXML: function() {
      let xml = $build('set', {xmlns: Strophe.NS.RSM});
      for (let ii = 0; ii < this.attribs.length; ii++) {
        let attrib = this.attribs[ii];
        if (typeof this[attrib] != 'undefined') {
          xml = xml.c(attrib).t(this[attrib].toString()).up();
        }
      }
      return xml.tree();
    },

    next: function(max) {
      let newSet = new Strophe.RSM({max: max, after: this.last});
      return newSet;
    },

    previous: function(max) {
      let newSet = new Strophe.RSM({max: max, before: this.first});
      return newSet;
    },

    fromXMLElement: function(xmlElement) {
      for (let ii = 0; ii < this.attribs.length; ii++) {
        let attrib = this.attribs[ii];
        let elem = xmlElement.getElementsByTagName(attrib)[0];
        if (typeof elem != 'undefined' && elem !== null) {
          this[attrib] = Strophe.getText(elem);
          if (attrib == 'first') {
            this.index = elem.getAttribute('index');
          }
        }
      }
    }
  };
}
