import random
import os

CUSTOM_FILE = "custom_categories.txt"

# Function to check if player has 4 same cards
def is_winner(hand):
    for card in set(hand):
        if hand.count(card) == 4:
            return card  # Return winning card
    return None

# Function to display cards
def show_cards(name, hand):
    print(f"\n{name}'s CARDS:")
    for i, c in enumerate(hand, 1):
        print(f"[{i}] {c}")
    print()

# Preset categories
preset_categories = {
    "1": ["Apple", "Mango", "Cherry", "Banana", "Grape", "Kiwi", "Orange", "Pineapple", "Strawberry", "Watermelon"],
    "2": ["BMW", "Tesla", "Audi", "Honda", "Ford", "Toyota", "Mercedes", "Lamborghini", "Ferrari", "Bugatti"]
}

# Load saved custom categories
def load_custom_categories():
    if os.path.exists(CUSTOM_FILE):
        with open(CUSTOM_FILE, "r") as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
        return lines
    return []

# Save new custom category
def save_custom_category(name, cards):
    # Remove old entry if exists
    if os.path.exists(CUSTOM_FILE):
        with open(CUSTOM_FILE, "r") as f:
            lines = f.readlines()
        with open(CUSTOM_FILE, "w") as f:
            for line in lines:
                if not line.startswith(name + ":"):
                    f.write(line)
    # Append new/updated category
    with open(CUSTOM_FILE, "a") as f:
        f.write(f"{name}: {','.join(cards)}\n")

# Ask number of players
num_players = int(input("Enter number of players (2-10): "))
while num_players < 2 or num_players > 10:
    num_players = int(input("Enter valid number of players (2-10): "))

# Ask player names
player_names = []
for i in range(num_players):
    name = input(f"Enter name for Player {i+1}: ")
    player_names.append(name)

# Load saved custom categories
saved_customs = load_custom_categories()

# Choose category
while True:
    print("\nChoose a card category:")
    print("1. Fruit")
    print("2. Cars")
    print("3. Custom (create new)")
    if saved_customs:
        print("4. Saved Custom Categories")
    category_choice = input("Enter choice (1-4): ")

    if category_choice in ["1", "2", "3"] or (category_choice == "4" and saved_customs):
        break
    print("Invalid choice!")

# Prepare card types
card_types = []

if category_choice in ["1", "2"]:
    card_types = preset_categories[category_choice][:num_players]

elif category_choice == "3":
    cat_name = input("Enter a name for your custom category: ")
    print(f"\nEnter at least 2 card names for your custom category (comma separated):")
    while True:
        cards_input = input("Card names: ").strip()
        cards_list = [c.strip() for c in cards_input.split(",") if c.strip()]
        if len(cards_list) >= 2:
            break
        print("Enter at least 2 card names!")
    card_types = cards_list
    save_custom_category(cat_name, card_types)
    print(f"Custom category '{cat_name}' saved!")

elif category_choice == "4":
    print("\nSaved Custom Categories:")
    for idx, c in enumerate(saved_customs, 1):
        cat_name = c.split(":")[0]
        print(f"{idx}. {cat_name}")
    while True:
        sel = input("Choose a saved custom category (enter number): ")
        if sel.isdigit():
            sel = int(sel)
            if 1 <= sel <= len(saved_customs):
                cat_name = saved_customs[sel-1].split(":")[0]
                card_list = saved_customs[sel-1].split(":")[1]
                cards = [c.strip() for c in card_list.split(",") if c.strip()]
                # If fewer cards than players, ask to add more
                if len(cards) < num_players:
                    print(f"\nThis category has only {len(cards)} card(s), but you have {num_players} players.")
                    needed = num_players - len(cards)
                    print(f"Please add {needed} more card(s) to this category:")
                    for i in range(needed):
                        new_card = input(f"Additional card {i+1}: ").strip()
                        while not new_card:
                            new_card = input(f"Additional card {i+1}: ").strip()
                        cards.append(new_card)
                    # Save updated category
                    save_custom_category(cat_name, cards)
                    print(f"Category '{cat_name}' updated with new cards.")
                # Take first num_players cards
                card_types = cards[:num_players]
                break
        print("Invalid selection! Please enter a valid number from the list.")

# Create deck: 4 copies of each card type
deck = []
for card in card_types:
    deck.extend([card]*4)

random.shuffle(deck)

# Deal cards evenly to players
players = [[] for _ in range(num_players)]
for i, card in enumerate(deck):
    players[i % num_players].append(card)

print("\n--- GAME STARTED ---")
for i in range(num_players):
    show_cards(player_names[i], players[i])

# Choose random starting player
turn = random.randint(0, num_players-1)
print(f"\nRandom Player {player_names[turn]} starts the game!")

# Gameplay loop
while True:
    hand = players[turn]

    # Check winner at start of turn
    winning_card = is_winner(hand)
    if winning_card:
        print(f"\n🔥 {player_names[turn]} WINS BEFORE TURN START! 🔥")
        print(f"Winning Set: 4 × {winning_card}")
        show_cards(player_names[turn], hand)
        break

    print(f"\n--- {player_names[turn]}'s TURN ---")
    show_cards(player_names[turn], hand)

    # Player chooses card to pass
    while True:
        choice = input(f"Choose a card to pass (1-{len(hand)}): ")
        if choice.isdigit():
            choice = int(choice)
            if 1 <= choice <= len(hand):
                break
        print("Invalid choice!")

    # Remove chosen card
    pass_card = hand.pop(choice-1)
    print(f"{player_names[turn]} passes {pass_card}")

    # Next player receives card
    next_turn = (turn + 1) % num_players
    players[next_turn].append(pass_card)
    print(f"{player_names[next_turn]} receives {pass_card}")

    # Check winner after receiving
    winning_card = is_winner(players[next_turn])
    if winning_card:
        print(f"\n🔥 {player_names[next_turn]} WINS THE GAME! 🔥")
        print(f"Winning Set: 4 × {winning_card}")
        show_cards(player_names[next_turn], players[next_turn])
        break

    # Next turn
    turn = next_turn
print("\n--- GAME OVER ---")