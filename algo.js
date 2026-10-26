const TokenType = Object.freeze({
    KEYWORD: "KEYWORD",
    IDENTIFIER: "IDENTIFIER",
    STRING: "STRING",
    NUMBER: "NUMBER",
    OPERATOR: "OPERATOR",
    PAREN_L: "PAREN_L",
    PAREN_R: "PAREN_R",
    EOF: "EOF"
});

const StmtType = Object.freeze({
    PROGRAM: "Program",
    START: "StartStatement",
    FINISH: "FinishStatement",
    PRINT: "PrintStatement",
    ASSIGNMENT: "AssignmentStatement",
    IF: "IfStatement",
    GO: "GoStatement"
});

class Lexer {
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.cursor = 0;
        this.line = 1;
        this.tokens = [];
        
        this.keywords = ["START", "IF", "THEN", "ELSE", "ECHO", "LINE", "GO", "FINISH"];
    }

    isAtEnd() {
        return this.cursor >= this.sourceCode.length;
    }
    advance() {
        return this.sourceCode[this.cursor++];
    }
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.sourceCode[this.cursor];
    }
    peekNext() {
        if (this.cursor + 1 >= this.sourceCode.length) return '\0';
        return this.sourceCode[this.cursor + 1];
    }

    tokenize() {
        while (!this.isAtEnd()) {
            let char = this.advance();

            if (char === ' ' || char === '\r' || char === '\t') {
                continue;
            }
            if (char === '\n') {
                this.line++;
                continue;
            }

            if (char === '/' && this.peek() === '/') {
                while (this.peek() !== '\n' && !this.isAtEnd()) {
                    this.advance();
                }
                continue;
            }

            if (char === '(') { this.addToken(TokenType.PAREN_L, "("); continue; }
            if (char === ')') { this.addToken(TokenType.PAREN_R, ")"); continue; }
            if (char === '"' || char === "'") {
                let quoteType = char;
                let str = "";
                while (this.peek() !== quoteType && !this.isAtEnd()) {
                    str += this.advance();
                }
                
                if (!this.isAtEnd()) {
                    this.advance();
                }
                
                this.addToken(TokenType.STRING, str);
                continue;
            }

            // ADDED '!' to the allowed operator characters array
            if (['=', '+', '-', '*', '/', '%', '>', '<', '!'].includes(char)) {
                let nextChar = this.peek();
                if (
                    (char === '+' && (nextChar === '+' || nextChar === '=')) ||
                    (char === '-' && (nextChar === '-' || nextChar === '=')) ||
                    (char === '*' && nextChar === '=') ||
                    (char === '/' && nextChar === '=') ||
                    (char === '%' && nextChar === '=') ||
                    (char === '=' && nextChar === '=') ||
                    (char === '>' && nextChar === '=') ||
                    (char === '<' && nextChar === '=') ||
                    (char === '!' && nextChar === '=') // ADDED check for '!=' compound operator
                ) {
                    this.addToken(TokenType.OPERATOR, char + this.advance());
                } else {
                    this.addToken(TokenType.OPERATOR, char);
                }
                continue;
            }

            if (/[0-9]/.test(char)) {
                let numStr = char;
                while (/[0-9.]/.test(this.peek()) && !this.isAtEnd()) {
                    numStr += this.advance();
                }
                this.addToken(TokenType.NUMBER, parseFloat(numStr));
                continue;
            }

            if (/[a-zA-Z_]/.test(char)) {
                let word = char;
                while (/[a-zA-Z0-9_]/.test(this.peek()) && !this.isAtEnd()) {
                    word += this.advance();
                }

                if (this.keywords.includes(word)) {
                    this.addToken(TokenType.KEYWORD, word);
                } else {
                    this.addToken(TokenType.IDENTIFIER, word);
                }
                continue;
            }

            throw new Error(`Unexpected character '${char}' at line ${this.line}`);
        }

        this.addToken(TokenType.EOF, "EOF");
        return this.tokens;
    }

    addToken(type, value) {
        this.tokens.push({ type: type, value: value, line: this.line });
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = this.validateAndTrim(tokens);
        this.current = 0;
    }

    validateAndTrim(tokens) {
        let startIndexes = [];
        let finishIndexes = [];

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === TokenType.KEYWORD && tokens[i].value === "START") startIndexes.push(i);
            if (tokens[i].type === TokenType.KEYWORD && tokens[i].value === "FINISH") finishIndexes.push(i);
        }

        if (startIndexes.length === 0) throw new Error("Missing START command.");
        if (startIndexes.length > 1) throw new Error("Multiple START commands found. Only 1 allowed.");
        if (finishIndexes.length === 0) throw new Error("Missing FINISH command.");
        if (finishIndexes.length > 1) throw new Error("Multiple FINISH commands found. Only 1 allowed.");

        let startIndex = startIndexes[0];
        let finishIndex = finishIndexes[0];

        this.startLine = tokens[startIndex].line;

        if (startIndex > finishIndex) throw new Error("START command must come before FINISH.");

        let trimmedTokens = tokens.slice(startIndex + 1, finishIndex);

        let finishLine = tokens[finishIndex].line;
        trimmedTokens.push({ type: TokenType.EOF, value: "EOF", line: finishLine });

        return trimmedTokens;
    }

    peek() { return this.tokens[this.current]; }
    isAtEnd() { return this.peek().type === TokenType.EOF; }
    advance() { 
        if (!this.isAtEnd()) this.current++; 
        return this.tokens[this.current - 1]; 
    }

    parse() {
        let statements = [];
        
        statements.push({ type: StmtType.START, line: this.startLine });

        while (!this.isAtEnd()) {
            statements.push(this.parseStatement());
        }
        
        statements.push({ type: StmtType.FINISH, line: this.peek().line });
        
        return { type: StmtType.PROGRAM, body: statements };
    }

    parseStatement() {
        let token = this.peek();
        let currentLine = token.line;

        if (token.type === TokenType.KEYWORD) {
            const keywordParsers = {
                "ECHO": () => this.parsePrint(),
                "LINE": () => this.parsePrint(),
                "IF":   () => this.parseIf(),
                "GO":   () => this.parseGo()
            };

            if (keywordParsers[token.value]) {
                let stmt = keywordParsers[token.value]();
                stmt.line = currentLine;
                return stmt;
            }
        }

        if (token.type === TokenType.IDENTIFIER) {
            let nextToken = this.tokens[this.current + 1];
            if (nextToken && nextToken.type === TokenType.OPERATOR && nextToken.value.includes("=")) {
                let stmt = this.parseAssignment();
                stmt.line = currentLine;
                return stmt;
            }
        }

        let unknownTokens = this.gatherTokensOnSameLine();
        throw new Error(`Unknown command or invalid syntax at line ${currentLine}: '${unknownTokens.map(t => t.value).join(' ')}'`);
    }

    parsePrint() {
        let command = this.advance().value;
        let expressionTokens = this.gatherTokensOnSameLine();
        
        return { 
            type: StmtType.PRINT, 
            command: command, 
            expression: expressionTokens 
        };
    }

    parseAssignment() {
        let name = this.advance().value;
        let operator = this.advance().value;
        let expressionTokens = this.gatherTokensOnSameLine();

        return {
            type: StmtType.ASSIGNMENT,
            name: name,
            operator: operator,
            expression: expressionTokens
        };
    }

    parseIf() {
        this.advance();
        
        let condition = [];
        while (!this.isAtEnd() && this.peek().value !== "THEN") {
            condition.push(this.advance());
        }
        this.advance();
        
        let trueAction = this.parseStatement();
        
        let falseAction = null;
        if (!this.isAtEnd() && this.peek().value === "ELSE") {
            this.advance();
            falseAction = this.parseStatement();
        }

        return {
            type: StmtType.IF,
            condition: condition,
            trueAction: trueAction,
            falseAction: falseAction
        };
    }

    parseGo() {
        this.advance();
        let expressionTokens = this.gatherTokensOnSameLine();
        return { type: StmtType.GO, expression: expressionTokens };
    }

    gatherTokensOnSameLine() {
        let tokens = [];
        let line = this.peek().line;
        while (!this.isAtEnd() && this.peek().line === line && this.peek().value !== "ELSE") {
            tokens.push(this.advance());
        }
        return tokens;
    }
}

class Evaluator {
    constructor() {
        this.output = ""; 
        this.environment = {
            "MAX_STEPS": 1000 
        }; 
        this.lineMap = {}; 
        this.currentIndex = 0;
        this.currentStep = 0;
        this.finished = false;
        this.lastLine = null;
    }

    evaluate(ast) {
        this.ast = ast;
        for (let i = 0; i < ast.body.length; i++) {
            let stmt = ast.body[i];
            if (!this.lineMap[stmt.line]) {
                this.lineMap[stmt.line] = i; 
            }
        }

        while (!this.finished) this.step();

        return this.output;
    }

    step() {
        if (this.finished) return this.snapshot();

        if (this.currentStep >= this.environment["MAX_STEPS"]) {
            this.output += `\nError: Max steps (${this.environment["MAX_STEPS"]}) reached. Do you have a hungry loop?\n`;
            this.finished = true;
            return this.snapshot();
        }

        const stmt = this.ast.body[this.currentIndex];
        this.lastLine = stmt.line;
        const jumpToLine = this.executeStatement(stmt);

        if (jumpToLine !== null) {
            if (this.lineMap[jumpToLine] !== undefined) {
                this.currentIndex = this.lineMap[jumpToLine];
            } else {
                this.output += `Error: Tried to GO to line ${jumpToLine}, but it doesn't exist.\n`;
                this.finished = true;
            }
        } else {
            this.currentIndex++;
        }

        this.currentStep++;
        if (this.currentIndex >= this.ast.body.length) this.finished = true;
        return this.snapshot();
    }

    snapshot() {
        return {
            output: this.output,
            variables: { ...this.environment },
            currentLine: this.finished ? null : this.ast.body[this.currentIndex]?.line ?? null,
            lastLine: this.lastLine,
            step: this.currentStep,
            finished: this.finished
        };
    }

    executeStatement(stmt) {
        if (!stmt) return null;

        if (stmt.type === StmtType.ASSIGNMENT) {
            let value = this.evaluateTokens(stmt.expression);
            
            if (stmt.operator === "=") this.environment[stmt.name] = value;
            else if (stmt.operator === "+=") this.environment[stmt.name] += value;
            else if (stmt.operator === "-=") this.environment[stmt.name] -= value;
            else if (stmt.operator === "*=") this.environment[stmt.name] *= value;
            else if (stmt.operator === "/=") this.environment[stmt.name] /= value;
            else if (stmt.operator === "%=") this.environment[stmt.name] %= value;
            
            return null;
        }

        if (stmt.type === StmtType.PRINT) {
            let value = this.evaluateTokens(stmt.expression);
            this.output += value; 
            if (stmt.command === "LINE") {
                this.output += "\n";
            }
            return null;
        }

        if (stmt.type === StmtType.IF) {
            let conditionResult = this.evaluateTokens(stmt.condition);
            return this.executeStatement(conditionResult ? stmt.trueAction : stmt.falseAction);
        }

        if (stmt.type === StmtType.GO) {
            let target = this.evaluateTokens(stmt.expression);
            if (typeof target === "string" && this.environment[target] !== undefined) {
                return this.environment[target];
            }
            return target; 
        }

        return null;
    }

    evaluateTokens(tokens) {
        if (!tokens || tokens.length === 0) return "";
        
        let evalArray = [];
        let rawArray = []; 
        
        for (let token of tokens) {
            if (token.type === TokenType.STRING) {
                evalArray.push(`"${token.value}"`);
                rawArray.push(token.value);
            } else if (token.type === TokenType.IDENTIFIER) {
                if (this.environment[token.value] !== undefined) {
                    const value = this.environment[token.value];
                    evalArray.push(typeof value === "number" ? `(${value})` : JSON.stringify(value));
                    rawArray.push(value);
                } else {
                    evalArray.push(`"${token.value}"`);
                    rawArray.push(token.value);
                }
            } else {
                evalArray.push(token.value);
                rawArray.push(token.value);
            }
        }

        try {
            return new Function('return ' + evalArray.join(''))();
        } catch (e) {
            return rawArray.join(''); 
        }
    }
}

const AlgoEngine = {
    createSession: function(sourceCode) {
        if (!sourceCode.trim()) throw new Error("No code provided.");

        const lexer = new Lexer(sourceCode);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const evaluator = new Evaluator();
        evaluator.ast = parser.parse();
        for (let i = 0; i < evaluator.ast.body.length; i++) {
            const stmt = evaluator.ast.body[i];
            if (evaluator.lineMap[stmt.line] === undefined) evaluator.lineMap[stmt.line] = i;
        }
        return evaluator;
    },
    run: function(sourceCode) {
        if (!sourceCode.trim()) {
            return ["No code provided."];
        }

        try {
            const lexer = new Lexer(sourceCode);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            const evaluator = new Evaluator();
            const rawOutputString = evaluator.evaluate(ast);

            return [rawOutputString]; 

        } catch (error) {
            return [`Syntax Error: ${error.message}`];
        }
    }
};