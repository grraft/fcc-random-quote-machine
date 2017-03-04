import React, { Component } from 'react';
import './App.css';
import request from 'request';
import jQuery from 'jquery'; // Since we need to strip html tags, we need this unfortunately

const tweetUrl = '' || location.href; // override url to tweet here, otherwise use current href

/**
 * Since quotesondesign returns html strings (i.e. tags embedded in string)
 *  we'll want to render it directly, but we must do so explicitely as per https://facebook.github.io/react/docs/dom-elements.html
 * @param {String} html 
 * @return {Object}
 */
const createMarkup = (html) => {
  return {__html: html};
}

const Buttons = ({getQuote, twitterHref}) => {
  return (
    <span className='buttons'>
      <a className='button' onClick={getQuote}>Next Quote</a>{' '}
      <a className='button button-primary' href={twitterHref} target='_blank'>Tweet</a>
    </span>
  )
}

const Error = () => {
  return (
    <h3>Not all those who wander are lost. But in this case maybe they are, sorry something went wrong. Try again</h3>
  )
}

const Quote = ({content, author, isLoading}) => {
  return (
    <div className={`quote-container ${isLoading ? 'loading' : 'loaded'}`}>
      <h2 className='quote-content' dangerouslySetInnerHTML={createMarkup(content)}></h2>
      <h5 className='quote-author' dangerouslySetInnerHTML={createMarkup(author)}></h5>                     
    </div>
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      loaded: 0,
      loading: false,
      quote: '',
      author: '',
    }

    this.getQuote = this.getQuote.bind(this);
    this.getDelayedQuote = this.getDelayedQuote.bind(this);
  }

  componentWillMount() {
    // getQuote if we haven't loaded any
    if (this.state.loaded < 1) {
      this.setState({ loading: true, error: false });
      this.getQuote();
    }
  }

  /**
   * get that satisfying transition fadeout/in instead offset
   *  abruptly replacing quote
   */
  getDelayedQuote() {
    this.setState({ loading: true });
    setTimeout( this.getQuote.bind(this), 250);
  }

  getQuote() {
    /**
     * grab single quote. Pass a random v so query isn't cached and new quotes are fetched
     *  this is needed when working in CodePen
     */
    const quotesAPI = `http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&v=${Math.random()}`;

    // this.setState not available within the request function so expose outside to make it accessible
    const onError = () => { this.setState({ error: true, loading: false }); }
    const onSuccess = (body) => { 
      const q = JSON.parse(body)[0]; // grab first element as we've only requested single quote      
      this.setState({ quote: q.content, author: q.title, loading: false, error: false }); 
    }
    // ajax call
    request(quotesAPI, function (error, response, body) {
      if (error || !body) {
        onError();
      } else {
        onSuccess(body);
      }
    });
  }

  render() {
    const twitterHref = `http://www.twitter.com/share?url=${tweetUrl}&text=${jQuery(this.state.quote).text()}/${this.state.author}`;
    const node = this.state.error ? <Error /> : <Quote content={this.state.quote} author={this.state.author} isLoading={this.state.loading} />;
    return (
      <div className='App'>
        <div className='row'>
          <div className='six offset-by-three columns buttons-container'>
            <Buttons getQuote={this.getDelayedQuote} twitterHref={twitterHref} />            
          </div>
        </div>

        <div className='row'>
          <div className='six offset-by-three columns'>
            {node}
          </div>
        </div>

        <div className='footer'>
        <div className='row'>
          <div className='six columns'>
            Design by <a href='' target='_blank'>Kunal Mandalia</a>
          </div>
          <div className='six columns'>
            Quotes curated by <a href='http://chriscoyier.net/' target='_blank'>Chris Coyier</a>{' '}
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default App;
