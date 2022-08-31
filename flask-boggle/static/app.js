// making the code for the bogglegame to both manipulate the DOM. 
// what part of the logic tells us that the code is best suited for a class over a regular function?
class BoggleGame {
    // make a new game at this Dom ID

    constructor(boardId, secs = 60) {
        this.secs = secs; //game length
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        //every 1000 msec, "tick"
        this.timer = setInterval(this.tick.bind(this), 1000); //need a refresher on theses methods and "bind"

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));//this is an event listener when clicking "submit" then something happens
    }
    // show word in list of words

    showWord(word) {
        $(".words", this.board).append($("<li>", { text: word })); //this creats an li containing the text word along with jinja?
    }

    // show the score with a simple JQUERY were we get the values from board and score
    showScore() {
        $(".score", this.board).text(this.score);
    }

    // show a status message

    showMessage(msg, cls) {
        $(".msg", this.board).text(msg).removeClass().addClass(`msg ${cls}`);
    }

    // handle submission of word: if unique and valid, score & show

    async handleSubmit(evt) { //need a refresher on async...believe it is a function that doesnt run till DOM populates
        evt.preventDefault(); //prevents the forms from clearing when submitted
        const $word = $(".word", this.board); //what is $word need a refresher on this code syntax "what is its purpose"

        let word = $word.val();
        if (!word) return; // is user's word does not match actual word, just leave

        if (this.words.has(word)) {
            this.showMessage(`Already found ${word}`, "err");
            return;
        }
// we are going to check the validity of the word with our own server and py files
        const resp = await axios.get("/check-word", { params: { word: word }});
        //if the word we are comparing  doesnt match our database from the server then...
        if (resp.data.result === "not-word") {
            this.showMessage(`${word} is not a valid English word`, "err");
            //another conditional when comparing the user's word to our DB.
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`${word} is not a valid word on this board`, "err");
            //if above doesnt apply then you have successfully entered in the word
        } else {
            this.showWord(word);
            this.score += word.length;
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        $word.val("").focus(); //need to look up this JQUERY syntax
    }
    //update timer in DOM
    showTimer() {
        $(".timer", this.board).text(this.secs); //might need a refresher on optional second parameter 
    }
    // tick: handle a second passing in game
//this handles the decreasing value of the timmer. I would have thought it would be something like this.secs -- 1
    async tick() {
        this.secs -= 1;
        this.showTimer();
//this code operates when the timer hits 0 and it'll stop counting till scoreGame function operates
        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    //end of game score

    async scoreGame() {
        //the logic for when the game is over, we will hide the board
        $(".add-word", this.board).hide();
        //then gather the scores from the server
        const resp = await axios.post("/post-score", { score: this.score });

        if (resp.data.brokenRecord) { //not sure what this is saying. looks like it is keeping track of all scores, storing the highest. if highest is replaced, then..
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}