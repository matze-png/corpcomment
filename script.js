// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';

const counterEl = document.querySelector('.counter');
const textareaEl = document.querySelector('.form__textarea');
const formEL = document.querySelector('.form');
const feedbackListEL = document.querySelector('.feedbacks');
const submitBtnEL = document.querySelector('.submit-btn');
const spinnerEL = document.querySelector('.spinner');
const hashtagListEL = document.querySelector('.hashtags');

const renderFeedbackItem = (feedbackItem) => {
    // new feedback item
    const feedbackItemHTML = `
        <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedbackItem.company}</p>
                <p class="feedback__text">${feedbackItem.text}</p>
            </div>
            <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
        </li>
    `;

    // insert feedback html
    feedbackListEL.insertAdjacentHTML('beforeend', feedbackItemHTML);
};

// -- COUNTER COMPONENT --
(() => {
    const inputHandler = () => {
        const numberOfChar = textareaEl.value.length;
        const counter = MAX_CHARS - numberOfChar;
    
        counterEl.textContent = counter;
    
        // console.log('numberOfChar');
    };
    
    textareaEl.addEventListener('input', inputHandler);
})();

// -- FORM COMPONENT --
(() => {
    const showVisualIndicator = (textCheck) => {
        const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';
    
        // show valid indicator
        formEL.classList.add(className);
    
        // remove visual indicator
        setTimeout(() => {
            formEL.classList.remove(className);
        }, 2000);
    
    };
    
    submitHandler = (event) => {
        // prevent default browser
        event.preventDefault();
    
        // get text from textarea
        const text = textareaEl.value;
    
        // validate text
        if(text.includes('#') && text.length >= 5) {
            showVisualIndicator('valid');
            
        } else {
            showVisualIndicator('invalid');
    
            // focus textarea
            textareaEl.focus();
    
            // stop this function execution
            return;
        }
    
        // we have text, now extract other info from text
        const hashtag = text.split(' ').find(word => word.includes('#'));
        const company = hashtag.substring(1);
        const badgeLetter = company.substring(0, 1).toUpperCase();
        const upvoteCount = 0;
        const daysAgo = 0;
    
        const feedbackItem = {
            upvoteCount: upvoteCount,
            company: company,
            badgeLetter: badgeLetter,
            daysAgo: daysAgo,
            text: text
        };
        
        // render feedback item
        renderFeedbackItem(feedbackItem);
    
        // send feedback item to server
        fetch(`${BASE_API_URL}/feedbacks`, {
            method: 'POST',
            body: JSON.stringify(feedbackItem),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(! response.ok) {
                console.log('Something went wrong');
                return;
            }
            console.log('Successfully submitted');
        }).catch(error => console.log(error));
    
        // clear textarea
        textareaEl.value = '';
    
        // blur submit button
        submitBtnEL.blur();
    
        // reset counter
        counterEl.textContent = MAX_CHARS;
    };
    
    formEL.addEventListener('submit', submitHandler);
})();

// -- FEEDBACK LIST COMPONENT --
(() => {
    const clickHandler = event => {
        // get clicked html element
        const clickedEl = event.target;
        
        // determine if user intended to upvote or expand
        const upvoteIntention = clickedEl.className.includes('upvote');
        
        if(upvoteIntention) {
            // get closest upvote button
            const upvoteBtnEl = clickedEl.closest('.upvote');
    
            // disable upvote button (prevent double-clicks, spam)
            upvoteBtnEl.disabled = true;
    
            // select the upvote count element within the upvote button
            const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');
    
            // get currently displayed upvote count as number (+)
            let upvoteCount = +upvoteCountEl.textContent;
    
            // set upvote count incremented by 1
            upvoteCountEl.textContent = ++upvoteCount
    
        } else {
            // expand the clicked feedback item
            clickedEl.closest('.feedback').classList.toggle('feedback--expand');
        }
    
    };
    
    feedbackListEL.addEventListener('click', clickHandler);
    
    
    // -- FEEDBACK LIST COMPONENT --
    fetch(`${BASE_API_URL}/feedbacks`)  
        .then(response => response.json())
        .then(data => {
            // remove spinner
            spinnerEL.remove();
    
            // iterate over each element in feedback array and render it in list
            data.feedbacks.forEach(feedbackItem => { renderFeedbackItem(feedbackItem);  });
    
        })
        .catch(error => {
            feedbackListEL.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
        });
})();

// -- HASHTAG LIST COMPONENT --
(() => {
    const clickHandler = (event) => {
        // get the clicked element
        const clickedEL = event.target;
    
        // stop function if click happens in list, but outside buttons
        if(clickedEL.className === 'hashtags') return;
        
        // extract the company name
        const companyNameFromHashtag = clickedEL.textContent.substring(1).toLowerCase().trim();
    
        // iterate over each feedback item in the list
        feedbackListEL.childNodes.forEach(childNode => {
            // stop this iteration if it's a text note
            if(childNode.nodeType === 3) return;
    
            // extract company name
            const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();
    
            // remove feedback item from list if company names are not equal
            if(companyNameFromHashtag !== companyNameFromFeedbackItem) {
                childNode.remove();
            }
    
        });
    
    };
    
    hashtagListEL.addEventListener('click', clickHandler);
})();