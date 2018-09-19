import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import anchorme from "anchorme";
import {nl2br} from '../helpers';

export default class TalkHistory extends React.Component {
  constructor(props) {
    super(props);

    this.linkProperties = {
      target: "_blank",
      tagName : "p"
    };
  }

  componentWillMount(){
    this.props.actions.loadArchieveMessagesOnTalkHistoryComponentDidMount(this.props.jid);
  }

  componentWillUpdate() {
    this.shouldScrollBottom = this.srollBoxEl.scrollTop + this.srollBoxEl.offsetHeight === this.srollBoxEl.scrollHeight;
    this.scrollTop = this.srollBoxEl.scrollTop;
    this.scrollHeight = this.srollBoxEl.scrollHeight;
  }

  componentDidUpdate () {
    this._moveScrollBottom();
    this.srollBoxEl.scrollTop = this.scrollTop + ( this.srollBoxEl.scrollHeight - this.scrollHeight );
  }
  //
  _moveScrollBottom () {
    if( this.shouldScrollBottom ){
      this.srollBoxEl.scrollTop = this.srollBoxEl.scrollHeight;
    }
  }

  _handleScroll() {
    if( this.srollBoxEl.scrollTop === 0 ){
      this.props.actions.actionScrollHistory(this.props.jid);
    }
  }

  //
  render () {
    return (
      <div className="x2chat--talkHistory">
        <div ref={el => {this.srollBoxEl = el;}} onClick={this._handleScroll.bind(this)} onScroll = {this._handleScroll.bind(this)} className="x2chat--talkHistory--inner">
          {
            this.props.history.map((el) => {
              let msgCssClass = ' _ownMsg';
              let ownMsg = true;
              //
              if (el.from === this.props.jid) {
                msgCssClass = '';
                ownMsg = false;
              }

              let body  = nl2br(el.body);
              let formatedBody = anchorme(body,{
                attributes:[ // attributes is an array
                  // an object that describes the attribute
                  // will produce: class="link"
                  {
                    name:"class",
                    value:"link"
                  },
                  // a function that returns an object
                  function(urlObj){
                    if(urlObj.reason === "ip") return {name:"class",value:"ip-link"};
                  },
                  function(urlObj){
                    if(urlObj.protocol !== "mailto:") return {name:"target",value:"blank"};
                  },
                ]
              });

              //
              return (
                <div className={'x2chat--talkHistory--item' + msgCssClass} key={el.unixTimeMs}>
                  <div className="_body" dangerouslySetInnerHTML={{ __html: formatedBody }}></div>
                  <div className="_from">{(ownMsg) ? 'You' : el.name} {moment(el.time).format('DD/MM/YY HH:mm')}</div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

TalkHistory.propTypes = {
  jid: PropTypes.string.isRequired,
  history: PropTypes.array,
  actions: PropTypes.object.isRequired
};
