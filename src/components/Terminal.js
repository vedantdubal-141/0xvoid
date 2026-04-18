import React, { useState, useRef, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import skillsContent from '../constants/skillsContent';
import helpContent from '../constants/helpContent';
import { showNeofetch } from '../constants/neofetchContent';
import { showAbout } from '../constants/aboutContent';
import { getAsciiArt } from '../constants/asciiSelfie';
import { logo } from '../assets/ascii';
import HollywoodEffect from './HollywoodEffect/HollywoodEffect';
import ProjectsMasonry from '../constants/projectsContent';
import WhoamiCard from './WhoamiCard';

// Lazy load heavy game components
const Calculator = lazy(() => import('./Calculator/Calculator'));

// Lazy load utility components
const QRGenerator = lazy(() => import('./QRGenerator/QRGenerator'));
const PasswordGenerator = lazy(() => import('./PasswordGenerator/PasswordGenerator'));
const GitHubFeed = lazy(() => import('./GitHubFeed/GitHubFeed'));

// Memoized Levenshtein distance calculation
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i - 1][j - 1], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
};

// Memoized command similarity finder
const findSimilarCommands = (input, availableCommands) => {
  const suggestions = availableCommands
    .map(cmd => ({
      command: cmd,
      distance: levenshteinDistance(input.toLowerCase(), cmd.toLowerCase())
    }))
    .filter(({ distance }) => distance <= 2 && distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .map(({ command }) => command);

  return suggestions.slice(0, 3); // Return top 3 suggestions
};

const Terminal = () => {
  const [output, setOutput] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [input, setInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [hackermode, setHackermode] = useState(false);
  const [isPasswordPrompt, setIsPasswordPrompt] = useState(false);
  const [insults, setInsults] = useState([]);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const suppressAutoScrollRef = useRef(false);
  const pendingScrollOffsetRef = useRef(0);
  const lastHandledHashRef = useRef('');
  const { changeBackgroundColor, backgrounds } = useTheme();

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/insult.txt`)
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').map(line => line.trim().replace(/^"|"$/g, '')).filter(Boolean);
        setInsults(lines);
      })
      .catch(err => console.error('Failed to load insults', err));
  }, []);

  // Memoized available commands array
  const availableCommands = useMemo(() => [
    'help', 'github', 'gh', 'email', 'em', 'linkedin', 'li',
    'skills', 'skill', 'projects', 'p',
    'clear', 'c', 'who', 'w',
    'neofetch', 'nf', 
    'time', 'date', 'background', 'theme', 'themes', 'bg',
    'color', 'calculator', 'hackermode', 'qr-generator',
    'password-generator', 'pwd', 'sudo',
    'about', 'about me', 'fastfetch', 'ff', 'resume', 'cv'
  ], []);

  // Memoized banners to avoid recreation on every render
  const banners = useMemo(() => ({
    large: logo + "\n             VEDANT TERMINAL",
    small: logo + "\n         VEDANT TERMINAL"
  }), []);

  // Memoized add to output function
  const addToOutput = useCallback((newEntry) => {
    setOutput(prev => {
      const updated = [...prev, newEntry];
      // Keep only the last 100 entries to prevent memory bloat
      return updated.length > 100 ? updated.slice(-100) : updated;
    });
  }, []);

  // Memoized similar commands finder
  const getSimilarCommands = useCallback((input) => {
    return findSimilarCommands(input, availableCommands);
  }, [availableCommands]);

  // Memoized command handler (defined early to avoid dependency issues)
  const handleCommand = useCallback((command) => {
    if (isPasswordPrompt) {
      // Pick a random insult
      const randomInsult = insults.length > 0 
        ? insults[Math.floor(Math.random() * insults.length)]
        : "You are the weakest link.";
      
      addToOutput({ type: 'output', content: randomInsult });
      setIsPasswordPrompt(false);
      setInput('');
      return;
    }

    const [cmd, ...args] = command.toLowerCase().trim().split(' ');
    const argument = args.join(' ');

    if (['sudo', 'mkdir', 'cp', 'mv'].includes(cmd)) {
      addToOutput({ type: 'output', content: `[sudo] password for user:` });
      setIsPasswordPrompt(true);
      setInput('');
      return;
    }

    // Check if command exists in availableCommands
    if (!availableCommands.includes(cmd)) {
      const suggestions = getSimilarCommands(cmd);
      if (suggestions.length > 0) {
        const suggestionLinks = suggestions
          .map(suggestion => `<span class="command-link" style="color: #5abb9a; cursor: pointer;" data-command="${suggestion}">${suggestion}</span>`)
          .join(', ');
        addToOutput({ type: 'output', content: `Command not found. Did you mean: ${suggestionLinks}?` });
        return;
      }
    }

    switch (cmd) {
      case 'skills':
      case 'skill':
      case 'sk':
      case 's':
        addToOutput({ type: 'output', content: skillsContent });
        break;
      case 'projects':
      case 'p':
      case 'pr':
        addToOutput({ type: 'component', content: <ProjectsMasonry /> });
        break;
      case 'resume':
      case 'cv':
        window.open(process.env.PUBLIC_URL + '/resume.html', '_blank');
        addToOutput({ type: 'output', content: 'Opening Resume...' });
        break;
      case 'github':
      case 'gh':
        window.open('https://github.com/vedantdubal-141/', '_blank');
        addToOutput({ type: 'output', content: 'Opening GitHub profile...' });
        break;
      case 'email':
      case 'em':
        window.open('mailto:vedant.dubal.cg@gmail.com', '_blank');
        addToOutput({ type: 'output', content: 'Opening email client...' });
        break;
      case 'linkedin':
      case 'li':
        window.open('https://www.linkedin.com/in/vedant-p-dubal-2107733a4', '_blank');
        addToOutput({ type: 'output', content: 'Opening LinkedIn profile...' });
        break;
      case 'clear':
      case 'c':
        setOutput([]);
        break;
      case 'help':
        addToOutput({ type: 'output', content: helpContent });
        break;
      case "neofetch":
      case "nf":
        showNeofetch(addToOutput);
        break;
      case 'about':
      case 'about me':
      case 'fastfetch':
      case 'ff':
        showAbout(addToOutput);
        break;
      case 'who':
      case 'w':
        addToOutput({ type: 'component', content: <WhoamiCard /> });
        break;
      case 'hackermode':
        setHackermode(prev => !prev);
        addToOutput({ type: 'output', content: `Hackermode ${hackermode ? 'deactivated' : 'activated'}` });
        break;
      case 'calculator':
        addToOutput({
          type: 'component', content: (
            <Suspense fallback={<div>Loading calculator...</div>}>
              <Calculator />
            </Suspense>
          )
        });
        break;
      case 'qr-generator':
        addToOutput({
          type: 'component', content: (
            <Suspense fallback={<div>Loading QR Generator...</div>}>
              <QRGenerator />
            </Suspense>
          )
        });
        break;
      case 'password-generator':
        addToOutput({
          type: 'component', content: (
            <Suspense fallback={<div>Loading Password Generator...</div>}>
              <PasswordGenerator />
            </Suspense>
          )
        });
        break;
      case 'github-feed':
        addToOutput({
          type: 'component', content: (
            <Suspense fallback={<div>Loading GitHub Feed...</div>}>
              <GitHubFeed />
            </Suspense>
          )
        });
        break;
      case 'time':
        addToOutput({ type: 'output', content: `Current Time: ${new Date().toLocaleTimeString()}` });
        break;
      case 'date':
        addToOutput({ type: 'output', content: `Current Date: ${new Date().toLocaleDateString()}` });
        break;
      case 'background':
      case 'theme':
      case 'themes':
      case 'bg':
      case 'color':
        if (argument) {
          const selectedBackground = [...backgrounds.solid, ...backgrounds.gradients].find(bg => bg.name.toLowerCase() === argument.toLowerCase());
          if (selectedBackground) {
            changeBackgroundColor(selectedBackground.value);
            addToOutput({ type: 'output', content: `Background changed to ${selectedBackground.name}` });
          } else {
            addToOutput({ type: 'output', content: 'Invalid background. Please choose from the list.' });
          }
        } else {
          const backgroundOptions = [...backgrounds.solid, ...backgrounds.gradients].map(bg => (
            `<div key="${bg.name}" style="display: inline-block; margin: 5px;">
                <div style="width: 50px; height: 50px; background: ${bg.value}; cursor: pointer;" onclick="document.dispatchEvent(new CustomEvent('backgroundSelected', { detail: '${bg.name}' }))"></div>
              </div>`
          )).join('');
          addToOutput({ type: 'output', content: `<div style="display: flex; flex-wrap: wrap;">${backgroundOptions}</div>` });
        }
        break;
      case 'tos':
        window.open('#/tos', '_blank');
        addToOutput({ type: 'output', content: 'Opening Terms of Service...' });
        break;
      case 'pwd':
        addToOutput({ type: 'output', content: '/home/vedant' });
        break;
      case 'sudo':
        addToOutput({ type: 'output', content: 'permission denied: you do not have root access' });
        break;
      default:
        addToOutput({ type: 'output', content: 'Command not found. Type "help" for a list of commands.' });
        break;
    }
    setInput(''); // Clear the input field after handling the command
  }, [availableCommands, getSimilarCommands, addToOutput, hackermode, setHackermode, backgrounds, changeBackgroundColor, isPasswordPrompt, insults]);

  // Memoized command execution function
  const executeCommand = useCallback((command) => {
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');
    handleCommand(command);
  }, [handleCommand]);

  // Memoized typing simulation function
  const simulateTyping = useCallback((command) => {
    if (!command || typeof command !== 'string') {
      console.error('Invalid command:', command);
      return;
    }

    // Clean the command string to ensure no undefined characters
    const cleanCommand = command.trim();
    if (!cleanCommand) {
      console.error('Empty command after trimming:', command);
      return;
    }

    let index = 0;
    setInput(''); // Clear input
    const interval = setInterval(() => {
      if (index < cleanCommand.length) {
        const char = cleanCommand[index];
        if (char !== undefined && char !== null) {
          setInput((prev) => prev + char); // Add each character
        }
        index++;
      } else {
        clearInterval(interval);
        executeCommand(cleanCommand);
      }
    }, 100);
  }, [executeCommand]);

  // Convert URL hash to a terminal command and auto-execute
  useEffect(() => {
    const parseHashToCommand = (hash) => {
      if (!hash) return null;
      // remove leading # or #/
      const cleaned = hash.replace(/^#\/?/, '');
      if (!cleaned) return null;
      const parts = cleaned.split('/').filter(Boolean).map(p => {
        try { return decodeURIComponent(p); } catch { return p; }
      });
      if (parts.length === 0) return null;
      const head = (parts[0] || '').toLowerCase();
      const tail = parts.slice(1);
      const joinTail = tail.join(' ');

      // Map hash paths to commands
      switch (head) {
        case 'projects':
          return 'projects';
        case 'who':
          return 'who';
        case 'help':
          return 'help';
        case 'misc':
          // e.g., #/misc/calculator -> 'calculator'
          return tail.length ? joinTail.toLowerCase() : 'misc';
        case 'games':
          // e.g., #/games/snake -> 'snake'
          return tail.length ? tail[0].toLowerCase() : 'games';
        case 'google':
        case 'youtube':
        case 'wiki':
        case 'wikipedia':
        case 'chatgpt':
        case 'perplexity':
          // e.g., #/google/hello%20world -> 'google hello world'
          return tail.length ? `${head} ${joinTail}` : head;
        case 'background':
        case 'theme':
        case 'themes':
        case 'bg':
        case 'color':
          return tail.length ? `${head} ${joinTail}` : head;
        default: {
          // Direct command passthrough if supported
          // Examples: #/resume, #/cv, #/calculator, #/snake, #/2048
          const direct = [head, ...tail].join(' ').trim();
          return direct || null;
        }
      }
    };

    const maybeRunFromHash = () => {
      const { hash } = window.location;
      if (!hash || hash === '#' || hash === lastHandledHashRef.current) return;
      const cmd = parseHashToCommand(hash);
      if (cmd && typeof cmd === 'string') {
        lastHandledHashRef.current = hash;
        // Mirror typed input line for consistency and add to history
        addToOutput({ type: 'input', content: cmd });
        executeCommand(cmd);
      }
    };

    // Run on initial load (after a microtask so React mount settles)
    Promise.resolve().then(maybeRunFromHash);
    window.addEventListener('hashchange', maybeRunFromHash);
    return () => window.removeEventListener('hashchange', maybeRunFromHash);
  }, [addToOutput, executeCommand]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const welcomeMessage = `
      <div style="margin-bottom: 20px;">
      <div class="welcome-banner">
      <pre class="boot-logo" style="color: #5abb9a; line-height: 1.2;">
    ${isMobile ? banners.small : banners.large}
      </pre>
      </div>
      <div style="margin: 20px 0;">
      <p>Welcome to my personal portfolio! (Version 1.0.0)
      <p style="margin-top: 8px;">Type <span style="color: #5abb9a;">'help'</span> to see the list of available commands.</p>
      </div>
      </div>`;

    // Only set the welcome/help content if nothing has been printed yet.
    // This avoids overwriting deep-linked commands executed earlier in the mount cycle.
    setOutput(prev => (prev && prev.length)
      ? prev
      : [
        { type: 'output', content: welcomeMessage },
        { type: 'output', content: helpContent }
      ]
    );
    inputRef.current?.focus();

    const observer = new MutationObserver(() => {
      const el = terminalRef.current;
      if (!el) return;

      if (pendingScrollOffsetRef.current) {
        const newTop = Math.min(el.scrollHeight, el.scrollTop + pendingScrollOffsetRef.current);
        el.scrollTo({ top: newTop, behavior: 'smooth' });
        pendingScrollOffsetRef.current = 0;
        return;
      }

      if (!suppressAutoScrollRef.current) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }
    });

    if (terminalRef.current) {
      observer.observe(terminalRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [isMobile, banners.small, banners.large]);

  useEffect(() => {
    const handleCommandClick = (event) => {
      if (event.target.classList.contains('command-link')) {
        const command = event.target.getAttribute('data-command');
        if (command && command.trim()) {
          simulateTyping(command.trim());
        } else {
          console.error('Invalid command from click:', command);
        }
      }
    };

    document.addEventListener('click', handleCommandClick);

    return () => {
      document.removeEventListener('click', handleCommandClick);
    };
  }, [simulateTyping]);

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'c') {
      if (isPasswordPrompt) {
        addToOutput({ type: 'output', content: '^C' });
        setIsPasswordPrompt(false);
        setInput('');
      } else {
        addToOutput({ type: 'output', content: '^C' });
        setInput('');
      }
      return;
    }

    if (e.key === 'Enter') {
      const command = e.target.value.trim();
      if (isPasswordPrompt) {
        // Do not add password to history or echo as input
        handleCommand(command);
        e.target.value = '';
        return;
      }
      
      if (command) {
        setOutput(prev => {
          let updated = [...prev];
          const lastOutput = updated[updated.length - 1];
          if (lastOutput && lastOutput.type === 'output' && typeof lastOutput.content === 'string' && lastOutput.content.includes('Command not found')) {
            updated.pop(); // Remove the error message
            const possibleInput = updated[updated.length - 1];
            if (possibleInput && possibleInput.type === 'input') {
              updated.pop(); // Remove the invalid command input line
            }
          }
          return updated;
        });
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(commandHistory.length + 1);
        addToOutput({ type: 'input', content: command });
        handleCommand(command);
        e.target.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isPasswordPrompt && commandHistory.length > 0) {
        const nextIndex = historyIndex > 0 ? historyIndex - 1 : 0;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isPasswordPrompt && commandHistory.length > 0) {
        const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : commandHistory.length;
        setHistoryIndex(nextIndex);
        if (nextIndex === commandHistory.length) {
          setInput('');
          setSuggestion('');
        } else {
          setInput(commandHistory[nextIndex]);
        }
      }
    } else if (e.key === 'ArrowRight' && suggestion) {
      // Fish-like completion
      setInput(suggestion);
      setSuggestion('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestion) {
        setInput(suggestion);
        setSuggestion('');
      }
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (!val) {
      setSuggestion('');
      return;
    }
    const matchingCmd = availableCommands.find(cmd => cmd.startsWith(val.toLowerCase()));
    if (matchingCmd) {
      // Make suggestion maintain the case of what user typed for the matching part
      setSuggestion(val + matchingCmd.substring(val.length));
    } else {
      setSuggestion('');
    }
  };

  useEffect(() => {
    const handleBackgroundSelected = (event) => {
      const selectedBackground = [...backgrounds.solid, ...backgrounds.gradients].find(bg => bg.name === event.detail);
      if (selectedBackground) {
        changeBackgroundColor(selectedBackground.value);
        addToOutput({ type: 'output', content: `Background changed to ${selectedBackground.name}` });
      }
    };

    document.addEventListener('backgroundSelected', handleBackgroundSelected);

    return () => {
      document.removeEventListener('backgroundSelected', handleBackgroundSelected);
    };
  }, [backgrounds, changeBackgroundColor, addToOutput]);

  return (
    <div id="terminal" className="terminal-container" ref={terminalRef}>
      {hackermode && <HollywoodEffect />}
      {output.map((item, index) => (
        <div key={index}>
          {item.type === 'input' ? (
            <div>
              <span className="ownerTerminal"><b>vedant@profile</b></span>
              <b>:~$</b> {item.content}
            </div>
          ) : item.type === 'component' ? (
            <div>{item.content}</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
          )}
        </div>
      ))}

      <div className="command-input" style={{ flexWrap: 'wrap' }}>
        <span className="prompt" style={{ flexShrink: 0 }}>
          <span className="ownerTerminal"><b>vedant@profile</b></span>
          <b>:~$</b>&nbsp;
        </span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
          <input
            ref={inputRef}
            type={isPasswordPrompt ? "password" : "text"}
            className="command-field"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            style={{ position: 'relative', zIndex: 1, backgroundColor: 'transparent', width: '100%' }}
          />
          {suggestion && suggestion !== input && (
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: 'rgba(255, 235, 205, 0.3)', pointerEvents: 'none', zIndex: 0, fontFamily: "'Terminus', monospace", fontSize: 'inherit', whiteSpace: 'pre' }}>
              <span style={{ visibility: 'hidden' }}>{input}</span>
              <span>{suggestion.substring(input.length)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;
// update: add command history state management
// update: implement ArrowUp and ArrowDown history navigation
// update: add shell-style tab completion for commands
// update: fix: history index boundary issues when empty
// update: implement fuzzy matching for command suggestions
// update: improve automatic terminal scrolling behavior
// update: implement initial sudo command and password state
// update: add password prompt masking for sudo access
// update: fix: stale closure bug where handleCommand missed state updates
// update: implement sudo cancellation with Ctrl+C interrupt
// update: add unix-style insults for incorrect sudo attempts
// update: optimize command parsing regex for multi-argument support
// update: implement ArrowUp and ArrowDown history navigation
// update: add shell-style tab completion for commands
// update: implement fuzzy matching for command suggestions
// update: add password prompt masking for sudo access
// update: fix: stale closure bug where handleCommand missed state updates
// update: add unix-style insults for incorrect sudo attempts
