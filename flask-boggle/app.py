from boggle import Boggle
from flask import Flask, render_template, request,session, jsonify #need to look up why jsonify is here
from flask_debugtoolbar import DebugtoolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "sush"
debug = DebugtoolbarExtension(app) #wonder why this is not in the solution. assumed it goes with the Debugtoolbarext

boggle_game = Boggle()

# need to add some routes here for the redirects

@app.route("/")
def homepage():
    """show board."""

    board = boggle_game.make_board() #we are telling python where to this function(imported from boggle.py)
    session['board'] = board
    highscore = session.get("highscore", 0) #we are saving the score into the session starting at 0
    nplays = session.get("nplays", 0) #counter for the nun of plays in the game

    return render_template("index.html", board=board, highscore=highscore, nplays=nplays)

@app.route("/check-word")
def check_word():
    """check if word is in dictionary"""

    word = request.args["word"]
    board = session["board"]
    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result': response})

@app.route("/post-score", methods=["POST"])
def post_score():
    """receive score, update nplays, update high score if appropriate."""

    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)

    return jsonify(brokenRecord=score > highscore)