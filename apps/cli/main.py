#!/usr/bin/env python3
"""
Entry point and CLI handler for the deterministic task manager.
"""
import argparse
import sys
from typing import List

from apps.cli.task_service import TaskService
from apps.cli.repositories import get_repository
from apps.cli.commands.add_command import AddCommand
from apps.cli.commands.list_command import ListCommand
from apps.cli.commands.update_command import UpdateCommand
from apps.cli.commands.complete_command import CompleteCommand
from apps.cli.commands.delete_command import DeleteCommand


def create_parser(task_service: TaskService) -> argparse.ArgumentParser:
    """Create the argument parser with all available commands."""
    parser = argparse.ArgumentParser(
        prog='task-manager',
        description='A deterministic CLI task manager'
    )
    parser.add_argument(
        '--version', 
        action='version', 
        version='%(prog)s 1.0.0'
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Add command
    add_parser = subparsers.add_parser('add', help='Add a new task')
    add_parser.add_argument('--title', required=True, help='Task title')
    add_parser.add_argument('--description', help='Task description')

    # List command
    list_parser = subparsers.add_parser('list', help='List all tasks')

    # Update command
    update_parser = subparsers.add_parser('update', help='Update a task')
    update_parser.add_argument('--id', type=int, required=True, help='Task ID')
    update_parser.add_argument('--title', help='New task title')
    update_parser.add_argument('--description', help='New task description')

    # Complete command
    complete_parser = subparsers.add_parser('complete', help='Mark task as complete')
    complete_parser.add_argument('--id', type=int, required=True, help='Task ID')

    # Delete command
    delete_parser = subparsers.add_parser('delete', help='Delete a task')
    delete_parser.add_argument('--id', type=int, required=True, help='Task ID')

    return parser


def main(args: List[str] = None):
    """Main entry point for the CLI application."""
    if args is None:
        args = sys.argv[1:]

    # Initialize the repository
    repository = get_repository()
    
    # Initialize the task service with the repository
    task_service = TaskService(repository)

    # Create the argument parser
    parser = create_parser(task_service)

    # Parse the arguments
    parsed_args = parser.parse_args(args)

    # Execute the appropriate command based on the subcommand
    if parsed_args.command == 'add':
        command = AddCommand(task_service)
        result = command.execute(parsed_args.title, parsed_args.description)
        print(result)
    elif parsed_args.command == 'list':
        command = ListCommand(task_service)
        result = command.execute()
        print(result)
    elif parsed_args.command == 'update':
        command = UpdateCommand(task_service)
        result = command.execute(parsed_args.id, parsed_args.title, parsed_args.description)
        print(result)
    elif parsed_args.command == 'complete':
        command = CompleteCommand(task_service)
        result = command.execute(parsed_args.id)
        print(result)
    elif parsed_args.command == 'delete':
        command = DeleteCommand(task_service)
        result = command.execute(parsed_args.id)
        print(result)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()