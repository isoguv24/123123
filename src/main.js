const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const paddleWidth = 10;
    const paddleHeight = 80;
    const puckRadius = 15;
    const paddleSpeed = 10;
    const initialPuckSpeed = 7;
    const maxPuckSpeed = 15;
    const speedIncrement = 0.5;

    let player1Y = canvas.height / 2 - paddleHeight / 2;
    let player2Y = canvas.height / 2 - paddleHeight / 2;
    let puckX = canvas.width / 2;
    let puckY = canvas.height / 2;
    let puckSpeedX = initialPuckSpeed;
    let puckSpeedY = initialPuckSpeed;

    let player1Score = 0;
    let player2Score = 0;
    let winningScore = 5;
    let gameMode = 'multi';

    const keys = {
      w: false,
      s: false,
      ArrowUp: false,
      ArrowDown: false
    };

    const menuScreen = document.getElementById('menuScreen');
    const countdownScreen = document.getElementById('countdownScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const player1ScoreDisplay = document.getElementById('player1Score');
    const player2ScoreDisplay = document.getElementById('player2Score');

    let gameActive = false;
    let countdownActive = false;

    document.getElementById('singlePlayerButton').addEventListener('click', () => startGame('single'));
    document.getElementById('twoPlayerButton').addEventListener('click', () => startGame('multi'));

    document.addEventListener('keydown', (event) => {
      if (event.key in keys) {
        keys[event.key] = true;
      }
      if (event.key === 'Enter') {
        if (!gameActive) {
          menuScreen.classList.add('active');
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.key in keys) {
        keys[event.key] = false;
      }
    });

    function startGame(mode) {
      gameMode = mode;
      winningScore = parseInt(document.getElementById('winningScore').value);
      menuScreen.classList.remove('active');
      gameOverScreen.classList.remove('active');
      player1Score = 0;
      player2Score = 0;
      updateScore();
      startCountdown();
    }

    function startCountdown() {
      let countdown = 3;
      countdownScreen.textContent = countdown;
      countdownScreen.classList.add('active');
      countdownActive = true;
      const countdownInterval = setInterval(() => {
        countdown--;
        countdownScreen.textContent = countdown;
        if (countdown === 0) {
          clearInterval(countdownInterval);
          countdownScreen.classList.remove('active');
          countdownActive = false;
          gameActive = true;
          gameLoop();
        }
      }, 1000);
    }

    function resetGame() {
      player1Y = canvas.height / 2 - paddleHeight / 2;
      player2Y = canvas.height / 2 - paddleHeight / 2;
      puckX = canvas.width / 2;
      puckY = canvas.height / 2;
      puckSpeedX = initialPuckSpeed;
      puckSpeedY = initialPuckSpeed;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw center line and circle
      ctx.strokeStyle = 'white';
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Draw paddles
      ctx.fillStyle = 'white';
      ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
      ctx.fillRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight);

      // Draw puck
      ctx.beginPath();
      ctx.arc(puckX, puckY, puckRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();
    }

    function update() {
      if (!gameActive || countdownActive) return;

      // Move paddles
      if (keys.w && player1Y > 0) {
        player1Y -= paddleSpeed;
      }
      if (keys.s && player1Y < canvas.height - paddleHeight) {
        player1Y += paddleSpeed;
      }
      if (gameMode === 'multi') {
        if (keys.ArrowUp && player2Y > 0) {
          player2Y -= paddleSpeed;
        }
        if (keys.ArrowDown && player2Y < canvas.height - paddleHeight) {
          player2Y += paddleSpeed;
        }
      } else {
        // Simple AI for single player mode
        if (puckY < player2Y + paddleHeight / 2) {
          player2Y -= paddleSpeed;
        } else {
          player2Y += paddleSpeed;
        }
      }

      // Move puck
      puckX += puckSpeedX;
      puckY += puckSpeedY;

      // Bounce off top and bottom
      if (puckY - puckRadius < 0 || puckY + puckRadius > canvas.height) {
        puckSpeedY = -puckSpeedY;
      }

      // Bounce off paddles with angle and speed adjustment
      if (puckX - puckRadius <= paddleWidth && puckY > player1Y && puckY < player1Y + paddleHeight) {
        const deltaY = puckY - (player1Y + paddleHeight / 2);
        puckSpeedX = -puckSpeedX;
        puckSpeedY = deltaY * 0.3;
        increasePuckSpeed();
      }
      if (puckX + puckRadius >= canvas.width - paddleWidth && puckY > player2Y && puckY < player2Y + paddleHeight) {
        const deltaY = puckY - (player2Y + paddleHeight / 2);
        puckSpeedX = -puckSpeedX;
        puckSpeedY = deltaY * 0.3;
        increasePuckSpeed();
      }

      // Score and reset puck if it fully crosses the goal line
      if (puckX - puckRadius < 0) {
        if (puckX + puckRadius < 0) {
          player2Score++;
          updateScore();
          if (player2Score >= winningScore) {
            endGame('Player 2 Wins!');
          } else {
            gameActive = false;
            resetGame();
            startCountdown();
          }
        }
      }
      if (puckX + puckRadius > canvas.width) {
        if (puckX - puckRadius > canvas.width) {
          player1Score++;
          updateScore();
          if (player1Score >= winningScore) {
            endGame('Player 1 Wins!');
          } else {
            gameActive = false;
            resetGame();
            startCountdown();
          }
        }
      }
    }

    function increasePuckSpeed() {
      const speed = Math.sqrt(puckSpeedX * puckSpeedX + puckSpeedY * puckSpeedY);
      if (speed < maxPuckSpeed) {
        puckSpeedX *= (1 + speedIncrement / speed);
        puckSpeedY *= (1 + speedIncrement / speed);
      }
    }

    function updateScore() {
      player1ScoreDisplay.textContent = player1Score;
      player2ScoreDisplay.textContent = player2Score;
    }

    function endGame(message) {
      gameActive = false;
      gameOverScreen.textContent = message + ' Press Enter to Restart';
      gameOverScreen.classList.add('active');
    }

    function gameLoop() {
      if (!gameActive) return;
      draw();
      update();
      requestAnimationFrame(gameLoop);
    }
