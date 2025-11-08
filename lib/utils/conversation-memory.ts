/**
 * Conversation Memory Utility
 * Tracks conversation context for follow-up questions
 */

export interface ConversationContext {
  lastQuestion: string;
  lastAnswer: string;
  lastImage?: string;
  conversationHistory: Array<{
    question: string;
    answer: string;
    timestamp: number;
  }>;
  sceneContext?: string; // Current scene description
}

class ConversationMemory {
  private context: ConversationContext = {
    lastQuestion: '',
    lastAnswer: '',
    conversationHistory: [],
  };

  /**
   * Add a question-answer pair to conversation history
   */
  addExchange(question: string, answer: string, image?: string) {
    this.context.lastQuestion = question;
    this.context.lastAnswer = answer;
    if (image) {
      this.context.lastImage = image;
    }
    
    this.context.conversationHistory.push({
      question,
      answer,
      timestamp: Date.now(),
    });

    // Keep only last 10 exchanges
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory.shift();
    }
  }

  /**
   * Set the current scene context
   */
  setSceneContext(sceneDescription: string) {
    this.context.sceneContext = sceneDescription;
  }

  /**
   * Get conversation context for follow-up questions
   */
  getContext(): string {
    const parts: string[] = [];

    if (this.context.sceneContext) {
      parts.push(`Current scene: ${this.context.sceneContext}`);
    }

    if (this.context.lastQuestion && this.context.lastAnswer) {
      parts.push(`Previous question: ${this.context.lastQuestion}`);
      parts.push(`Previous answer: ${this.context.lastAnswer}`);
    }

    if (this.context.conversationHistory.length > 1) {
      const recent = this.context.conversationHistory.slice(-3);
      parts.push(`Recent conversation: ${recent.map(e => `Q: ${e.question} A: ${e.answer}`).join('; ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Check if a question is a follow-up to the last question
   */
  isFollowUpQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase();
    const followUpIndicators = [
      'where is',
      'where are',
      'which',
      'what about',
      'how many',
      'is there',
      'are there',
      'can you',
      'tell me more',
      'what else',
      'and',
      'also',
    ];

    return followUpIndicators.some(indicator => lowerQuestion.includes(indicator));
  }

  /**
   * Clear conversation history
   */
  clear() {
    this.context = {
      lastQuestion: '',
      lastAnswer: '',
      conversationHistory: [],
    };
  }

  /**
   * Get full context
   */
  getFullContext(): ConversationContext {
    return { ...this.context };
  }
}

// Singleton instance
export const conversationMemory = new ConversationMemory();

