import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { SettingsDialog } from '../settings-dialog/settings-dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';

interface ChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  dices?: any[];
}

@Component({
  selector: 'app-game',
  imports: [
    FormsModule, 
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './game.html',
  styleUrls: ['./game.scss', '../dice.scss', '../card.scss'],
})
export class Game implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  protected readonly inputText = signal('');
  protected readonly isStreaming = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);

  private messageIdCounter = 0;
  private shouldScrollToBottom = false;
  private serverUrl: string = "";
  readonly dialog = inject(MatDialog);
  public user: any = {};
  private route = inject(ActivatedRoute);

  constructor() {
    this.user.name = this.route.snapshot.paramMap.get('id') || "";

    const url = localStorage.getItem("url");
    if (url) {
      this.serverUrl = url;
      this.getUserInfos();
      this.retrieveMessagesHistory();
    }

    // this.messages.set([
    //   {
    //     id: 1,
    //     type: 'user',
    //     content:
    //       "The player's name is Arnaud and you can welcome them to the game. The player is a male Human Fighter. Describe the surroundings of the player and create an atmosphere that the player can bounce off of. Don't make more than 100 words.",
    //     timestamp: new Date('2025-08-14T01:31:04.039Z'),
    //   },
    //   {
    //     id: 2,
    //     type: 'agent',
    //     content:
    //       'Welcome, Arnaud the Human Fighter. You find yourself at the edge of a mist-shrouded forest clearing. The crumbling stones of an ancient watchtower loom before you, its darkened doorway gaping like a hungry mouth. The setting sun casts long shadows through the trees, and the distant howl of wolves echoes through the valley. Your well-worn sword hangs ready at your side, its familiar weight offering some comfort in this ominous place.',
    //     timestamp: new Date('2025-08-14T01:31:07.517Z'),
    //     suggestions: [
    //       "Investigate the watchtower's entrance",
    //       'Search the perimeter for recent tracks',
    //       'Make camp before darkness falls',
    //     ],
    //     dices: [],
    //   },
    //   {
    //     id: 3,
    //     type: 'user',
    //     content: "Investigate the watchtower's entrance",
    //     timestamp: new Date('2025-08-14T01:31:11.597Z'),
    //   },
    //   {
    //     id: 4,
    //     type: 'agent',
    //     content:
    //       "As you approach the watchtower's entrance, you notice ancient runes carved into the stone archway, barely visible beneath years of moss. A cool draft emanates from within, carrying a musty scent. Your boots crunch on scattered debris, and something metallic gleams in the dirt near the threshold. You hear faint scratching sounds coming from inside.",
    //     timestamp: new Date('2025-08-14T01:31:16.109Z'),
    //     suggestions: [
    //       'Clean and examine the mysterious runes',
    //       'Pick up the metallic object',
    //       'Ready your weapon and enter the tower',
    //     ],
    //     dices: [
    //       {
    //         dice_type: 'd20',
    //         result: 11,
    //         reason: 'Investigation check for entrance details',
    //       },
    //     ],
    //   },
    //   {
    //     id: 5,
    //     type: 'user',
    //     content: 'Clean and examine the mysterious runes',
    //     timestamp: new Date('2025-08-14T01:31:18.862Z'),
    //   },
    //   {
    //     id: 6,
    //     type: 'agent',
    //     content:
    //       "You brush away the thick moss, revealing intricate runes that pulse with a faint blue glow at your touch. The ancient script appears to be a warning, mentioning 'guardians' and 'eternal rest.' As you study them, you feel a subtle vibration through the stone, and the air grows noticeably colder. Your fighter's instinct tells you these runes are more than mere decoration.",
    //     timestamp: new Date('2025-08-14T01:31:24.543Z'),
    //     suggestions: [
    //       'Press the glowing runes to test their magic',
    //       'Draw your weapon and proceed inside cautiously',
    //       'Document the runes for later research',
    //     ],
    //     dices: [
    //       {
    //         dice_type: 'd20',
    //         result: 16,
    //         reason: 'Arcana check for magical properties',
    //       },
    //       {
    //         dice_type: 'd8',
    //         result: 6,
    //         reason: 'Intelligence check for comprehension',
    //       },
    //     ],
    //   },
    // ]);
  }

  async getUserInfos() {
    try {
      const data = await fetch(`${this.serverUrl}/user/${this.user.name}`);
      const user = await data.json();
      this.user.gender = user.gender;
      this.user.experience = user.experience;
      this.user.level = user.level;
      this.user.race = user.race;
      this.user.inventory = user.inventory;
      this.user.stats = user.stats;

    } catch (error) {
      console.log(error);
    }
  }
  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  async retrieveMessagesHistory() {
    try {
      const response = await fetch(`${this.serverUrl}/messages`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // const message = JSON.parse(data[1].content[0].text);
    const message = JSON.parse(data.slice(-1)[0].content[0].text)

    // Extract response and suggestions from the JSON
    const agentResponse =
      message.response || 'No response received from the agent.';
    const suggestions =
    message.actions_suggestions && Array.isArray(message.actions_suggestions)
        ? message.actions_suggestions.slice(0, 3)
        : [];

    // Add agent message with suggestions
    const newMessage: ChatMessage = {
      id: ++this.messageIdCounter,
      type: 'agent',
      content: agentResponse,
      timestamp: new Date(),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      dices: message.dices_rolls,
    };

    this.messages.update((messages) => [...messages, newMessage]);
    this.shouldScrollToBottom = true;
  } catch (error) {
    console.error('Request error:', error);
    this.addMessage(
      'agent',
      `Error: ${
        error instanceof Error ? error.message : 'Unknown error occurred'
      }`
    );
  } finally {
    this.isStreaming.set(false);
  }
  }

  openSettingsDialog() {
    const dialogRef = this.dialog.open(SettingsDialog);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.serverUrl = result;
    });
  }
  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private addMessage(type: 'user' | 'agent', content: string) {
    const newMessage: ChatMessage = {
      id: ++this.messageIdCounter,
      type,
      content,
      timestamp: new Date(),
    };

    this.messages.update((messages) => [...messages, newMessage]);
    this.shouldScrollToBottom = true;
  }

  async sendMessage() {
    const text = this.inputText();
    if (!text.trim()) return;

    // Add user message
    this.addMessage('user', text);
    this.inputText.set('');
    this.isStreaming.set(true);

    try {
        const response = await fetch(`${this.serverUrl}/inquire`, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = JSON.parse(result.response);

      // Extract response and suggestions from the JSON
      const agentResponse =
        data.response || 'No response received from the agent.';
      const suggestions =
        data.actions_suggestions && Array.isArray(data.actions_suggestions)
          ? data.actions_suggestions.slice(0, 3)
          : [];

      // Add agent message with suggestions
      const newMessage: ChatMessage = {
        id: ++this.messageIdCounter,
        type: 'agent',
        content: agentResponse,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        dices: data.dices_rolls,
      };

      this.messages.update((messages) => [...messages, newMessage]);
      this.shouldScrollToBottom = true;
    } catch (error) {
      console.error('Request error:', error);
      this.addMessage(
        'agent',
        `Error: ${
          error instanceof Error ? error.message : 'Unknown error occurred'
        }`
      );
    } finally {
      this.isStreaming.set(false);
    }
  }

  onSuggestionClick(suggestion: string) {
    if (this.isStreaming()) return; // Don't allow clicks while streaming

    this.inputText.set(suggestion);
    this.sendMessage();
  }
}
