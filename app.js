const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Character {
  constructor(name, health, attacks) {
    this.name = name;
    this.health = health;
    this.attacks = attacks;
  }

  isAlive() {
    return this.health > 0;
  }

  attackTarget(target, attack) {
    //damage is calculated by how well the player did in the 'player input phase'.
    //best result -> crit?
    //worst result --> miss or lowest damage possible?
    const damage =
      Math.floor(Math.random() * (attack.maxDamage - attack.minDamage + 1)) +
      attack.minDamage;
    target.health -= damage;
    console.log(`${this.name} attacks ${target.name} for ${damage} damage.`);
    if (!target.isAlive()) {
      console.log(`${target.name} has been defeated!`);
    }
  }
}

class Player extends Character {
  constructor(name) {
    const attacks = [
      {
        name: "Slash",
        minDamage: 10,
        maxDamage: 20,
        targetType: "SINGLE",
      },
      {
        name: "Fireball",
        minDamage: 20,
        maxDamage: 40,
        targetType: "ALL_ENEMIES",
      },
    ];
    super(name, 50, attacks);
  }
}

class Monster extends Character {
  constructor(name, attacks) {
    super(name, 50, attacks);
  }
}

async function battle(player, monsters) {
  console.log("Wild monsters are attacking!\n");

  await askQuestion("Enter any key to start the battle: ");

  while (player.isAlive() && monsters.some((monster) => monster.isAlive())) {
    for (const monster of monsters) {
      if (!monster.isAlive()) continue;

      console.log(`\n${player.name}'s health: ${player.health}`);
      console.log(`Enemies:`);
      for (const m of monsters) {
        if (m.isAlive()) {
          console.log(`${m.name} (Health: ${m.health})`);
        }
      }

      console.log(`\nAvailable attacks: `);
      player.attacks.forEach((attack, index) => {
        console.log(`${index + 1}.${attack.name}`);
      });

      const attackIndex = await askQuestion("Select an attack: ").then(
        (val) => parseInt(val) - 1,
      );
      const selectedAttack = player.attacks[attackIndex];
      if (!selectedAttack) {
        console.log("Invalid attack");
        continue;
      }
      let targetString = "Select a target: ";

      let target = null;

      if (selectedAttack.targetType === "ALL_ENEMIES") {
        monsters.forEach((target) => {
          if (!target.isAlive()) return;
          player.attackTarget(target, selectedAttack);
        });
      } else if (selectedAttack.targetType === "SINGLE") {
        monsters.forEach((monster, idx) => {
          targetString += `[${idx + 1}] ${monster.name} `;
        });

        let targetInputConfirmed = false;
        while (!targetInputConfirmed) {
          const targetId = await askQuestion(targetString);

          target =
            targetId <= monsters.length && targetId > 0
              ? monsters[targetId - 1]
              : null;

          if (!target || !target.isAlive()) {
            console.log("Invalid target.");
          } else {
            targetInputConfirmed = true;
            player.attackTarget(target, selectedAttack);
            if (!target.isAlive()) {
              continue;
            }
          }
        }
      }

      for (const monster of monsters) {
        if (!monster.isAlive()) continue;
        monster.attackTarget(player, monster.attacks[0]);
        if (!player.isAlive()) break;
      }

      if (!player.isAlive()) {
        break;
      }
    }
  }

  if (!player.isAlive()) {
    console.log("You ran away! Game Over!");
  } else if (monsters.every((monsters) => !monsters.isAlive())) {
    console.log("You win!");
  }

  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

const slimeAttacks = [
  {
    name: "Toss Slime",
    minDamage: 4,
    maxDamage: 8,
  },
];

const playerName = "Hero";
const monsters = [
  new Monster("Monster A", slimeAttacks),
  new Monster("Monster B", slimeAttacks),
  new Monster("Monster C", slimeAttacks),
];

const player = new Player(playerName);

battle(player, monsters);
