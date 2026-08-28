/**
 * Deterministic mathematical expression evaluator
 * Handles operator precedence, functions, parentheses, constants, powers, factorials, and trigonometry (DEG/RAD).
 */

export interface EvaluationResult {
  success: boolean;
  result?: string;
  numericValue?: number;
  error?: string;
}

export class MathEngine {
  private static isDegreeMode = true;

  public static setDegreeMode(isDeg: boolean) {
    this.isDegreeMode = isDeg;
  }

  public static getDegreeMode(): boolean {
    return this.isDegreeMode;
  }

  /**
   * Evaluates a mathematical expression safely.
   */
  public static evaluate(rawExpression: string, degMode = this.isDegreeMode): EvaluationResult {
    if (!rawExpression || !rawExpression.trim()) {
      return { success: false, error: 'Empty expression' };
    }

    try {
      const sanitized = this.preprocess(rawExpression);
      const tokens = this.tokenize(sanitized);
      const rpn = this.toRPN(tokens);
      const val = this.evaluateRPN(rpn, degMode);

      if (isNaN(val) || !isFinite(val)) {
        return { success: false, error: 'Undefined or Infinity' };
      }

      // Format result nicely
      const formatted = this.formatNumber(val);
      return {
        success: true,
        result: formatted,
        numericValue: val,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Syntax Error',
      };
    }
  }

  private static formatNumber(num: number): string {
    if (Math.abs(num) < 1e-12 && num !== 0) {
      return '0';
    }
    // Check if it's very close to an integer
    if (Math.abs(num - Math.round(num)) < 1e-10) {
      return Math.round(num).toString();
    }
    // High precision but avoid float noise like 0.30000000000000004
    const rounded = parseFloat(num.toPrecision(12));
    // If exponential notation is needed
    if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(6).replace('e+', 'e');
    }
    return rounded.toString();
  }

  private static preprocess(expr: string): string {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/√\s*\(/g, 'sqrt(')
      .replace(/√([0-9πe.]+)/g, 'sqrt($1)')
      .replace(/π/g, 'pi')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      // Postfix percentage: e.g. 50% -> (50*0.01), (2+3)% -> ((2+3)*0.01)
      .replace(/(\d+(\.\d+)?)%/g, '($1*0.01)')
      .replace(/(\))%/g, '($1*0.01)')
      // Implicit multiplication e.g. 2pi -> 2*pi, 2(3) -> 2*(3), (2)(3) -> (2)*(3), 5sin -> 5*sin
      .replace(/(\d)(\()/g, '$1*$2')
      .replace(/(\))(\d)/g, '$1*$2')
      .replace(/(\))(\()/g, '$1*$2')
      .replace(/(\d)(pi|e|sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs)/gi, '$1*$2')
      .replace(/(pi|e)(\d)/gi, '$1*$2')
      .replace(/(\))(pi|e|sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs)/gi, '$1*$2');

    // Auto-close missing open parentheses
    let openCount = 0;
    for (const char of sanitized) {
      if (char === '(') openCount++;
      else if (char === ')') openCount--;
    }
    while (openCount > 0) {
      sanitized += ')';
      openCount--;
    }

    return sanitized;
  }

  private static tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    const n = expr.length;

    while (i < n) {
      const ch = expr[i];

      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      if (/[0-9.]/.test(ch)) {
        let numStr = '';
        let dotCount = 0;
        while (i < n && /[0-9.]/.test(expr[i])) {
          if (expr[i] === '.') {
            dotCount++;
            if (dotCount > 1) throw new Error('Invalid number format with multiple decimals');
          }
          numStr += expr[i];
          i++;
        }
        tokens.push(numStr);
        continue;
      }

      // Identifiers (functions or constants)
      if (/[a-zA-Z]/.test(ch)) {
        let word = '';
        while (i < n && /[a-zA-Z0-9_]/.test(expr[i])) {
          word += expr[i];
          i++;
        }
        word = word.toLowerCase();
        tokens.push(word);
        continue;
      }

      // Operators and punctuation
      if ('+-*/%^()!'.includes(ch)) {
        tokens.push(ch);
        i++;
        continue;
      }

      throw new Error(`Unexpected character: '${ch}'`);
    }

    // Handle unary plus and minus
    const refined: string[] = [];
    for (let j = 0; j < tokens.length; j++) {
      const t = tokens[j];
      const prev = refined[refined.length - 1];

      if (t === '-' || t === '+') {
        const isUnary = !prev || prev === '(' || ['+', '-', '*', '/', '%', '^'].includes(prev);
        if (isUnary) {
          refined.push(t === '-' ? 'neg' : 'pos');
          continue;
        }
      }
      refined.push(t);
    }

    return refined;
  }

  private static getPrecedence(op: string): number {
    switch (op) {
      case 'pos':
      case 'neg':
        return 5;
      case '!':
        return 4;
      case '^':
        return 4;
      case '*':
      case '/':
      case '%':
        return 3;
      case '+':
      case '-':
        return 2;
      default:
        return 0;
    }
  }

  private static isRightAssociative(op: string): boolean {
    return op === '^' || op === 'neg' || op === 'pos';
  }

  private static isFunction(token: string): boolean {
    return ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs', 'exp'].includes(token);
  }

  private static isConstant(token: string): boolean {
    return ['pi', 'e'].includes(token);
  }

  private static toRPN(tokens: string[]): string[] {
    const output: string[] = [];
    const opStack: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (/^[0-9]+(\.[0-9]+)?$/.test(token) || this.isConstant(token)) {
        output.push(token);
      } else if (this.isFunction(token)) {
        opStack.push(token);
      } else if (token === '(') {
        opStack.push(token);
      } else if (token === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
          output.push(opStack.pop()!);
        }
        if (opStack.length === 0) {
          throw new Error('Mismatched parentheses');
        }
        opStack.pop(); // Remove '('

        if (opStack.length > 0 && this.isFunction(opStack[opStack.length - 1])) {
          output.push(opStack.pop()!);
        }
      } else {
        // Operator
        const p1 = this.getPrecedence(token);
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1] !== '(' &&
          (
            this.isFunction(opStack[opStack.length - 1]) ||
            this.getPrecedence(opStack[opStack.length - 1]) > p1 ||
            (this.getPrecedence(opStack[opStack.length - 1]) === p1 && !this.isRightAssociative(token))
          )
        ) {
          output.push(opStack.pop()!);
        }
        opStack.push(token);
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop()!;
      if (top === '(' || top === ')') {
        throw new Error('Mismatched parentheses');
      }
      output.push(top);
    }

    return output;
  }

  private static evaluateRPN(rpn: string[], degMode: boolean): number {
    const stack: number[] = [];

    const degToRad = (deg: number) => (deg * Math.PI) / 180;
    const radToDeg = (rad: number) => (rad * 180) / Math.PI;

    for (const token of rpn) {
      if (/^[0-9]+(\.[0-9]+)?$/.test(token)) {
        stack.push(parseFloat(token));
      } else if (token === 'pi') {
        stack.push(Math.PI);
      } else if (token === 'e') {
        stack.push(Math.E);
      } else if (token === 'neg') {
        if (stack.length < 1) throw new Error('Syntax error');
        stack.push(-stack.pop()!);
      } else if (token === 'pos') {
        if (stack.length < 1) throw new Error('Syntax error');
        // unary plus, no-op
      } else if (token === '!') {
        if (stack.length < 1) throw new Error('Syntax error');
        const n = stack.pop()!;
        if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial only defined for non-negative integers');
        let fact = 1;
        for (let k = 2; k <= n; k++) fact *= k;
        stack.push(fact);
      } else if (this.isFunction(token)) {
        if (stack.length < 1) throw new Error(`Missing argument for function ${token}`);
        const arg = stack.pop()!;
        switch (token) {
          case 'sin': {
            const angle = degMode ? degToRad(arg) : arg;
            // Clean up near-zero precision for sin(180), sin(360)
            const s = Math.sin(angle);
            stack.push(Math.abs(s) < 1e-15 ? 0 : s);
            break;
          }
          case 'cos': {
            const angle = degMode ? degToRad(arg) : arg;
            const c = Math.cos(angle);
            stack.push(Math.abs(c) < 1e-15 ? 0 : c);
            break;
          }
          case 'tan': {
            const angle = degMode ? degToRad(arg) : arg;
            if (Math.abs(Math.cos(angle)) < 1e-15) throw new Error('Tan is undefined at this angle');
            const t = Math.tan(angle);
            stack.push(Math.abs(t) < 1e-15 ? 0 : t);
            break;
          }
          case 'asin': {
            if (arg < -1 || arg > 1) throw new Error('asin argument out of range [-1, 1]');
            const res = Math.asin(arg);
            stack.push(degMode ? radToDeg(res) : res);
            break;
          }
          case 'acos': {
            if (arg < -1 || arg > 1) throw new Error('acos argument out of range [-1, 1]');
            const res = Math.acos(arg);
            stack.push(degMode ? radToDeg(res) : res);
            break;
          }
          case 'atan': {
            const res = Math.atan(arg);
            stack.push(degMode ? radToDeg(res) : res);
            break;
          }
          case 'log': {
            if (arg <= 0) throw new Error('Logarithm of non-positive number');
            stack.push(Math.log10(arg));
            break;
          }
          case 'ln': {
            if (arg <= 0) throw new Error('Natural logarithm of non-positive number');
            stack.push(Math.log(arg));
            break;
          }
          case 'sqrt': {
            if (arg < 0) throw new Error('Square root of negative number');
            stack.push(Math.sqrt(arg));
            break;
          }
          case 'abs': {
            stack.push(Math.abs(arg));
            break;
          }
          case 'exp': {
            stack.push(Math.exp(arg));
            break;
          }
          default:
            throw new Error(`Unknown function ${token}`);
        }
      } else {
        // Binary operators
        if (stack.length < 2) throw new Error('Syntax error in expression');
        const b = stack.pop()!;
        const a = stack.pop()!;

        switch (token) {
          case '+':
            stack.push(a + b);
            break;
          case '-':
            stack.push(a - b);
            break;
          case '*':
            stack.push(a * b);
            break;
          case '/':
            if (b === 0) throw new Error('Division by zero');
            stack.push(a / b);
            break;
          case '%':
            stack.push(a % b);
            break;
          case '^':
            stack.push(Math.pow(a, b));
            break;
          default:
            throw new Error(`Unknown operator ${token}`);
        }
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression evaluation');
    }

    return stack[0];
  }
}
