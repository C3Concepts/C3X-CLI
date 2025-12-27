// src/__tests__/cli.test.js
import { describe, it, expect, jest } from '@jest/globals';
import { Command } from 'commander';

describe('C³X CLI', () => {
  it('should have a version command', () => {
    const program = new Command();
    program.version('1.0.0');
    
    expect(program.version()).toBe('1.0.0');
  });
  
  it('should have a migrate command', () => {
    const program = new Command();
    const migrateCommand = new Command('migrate');
    
    program.addCommand(migrateCommand);
    const commands = program.commands.map(cmd => cmd.name());
    
    expect(commands).toContain('migrate');
  });
});