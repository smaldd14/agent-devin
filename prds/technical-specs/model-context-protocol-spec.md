# Technical Specification: Model Context Protocol for Kitchen Management Agent

## Overview

This technical specification outlines the implementation of a Model Context Protocol (MCP) for the Kitchen Management AI agent. The MCP serves as an interface layer between the LLM-powered agent and the existing application API, providing a structured way for the agent to interact with the database while leveraging existing CRUD operations.

## Purpose and Goals

### Purpose
To create a structured protocol that allows the AI agent to communicate with the existing Kitchen Management API in a consistent, reliable manner, reducing hallucinations and improving the accuracy of database operations.

### Goals
- **Standardize Interactions**: Create a consistent format for the agent to interact with the application API
- **Leverage Existing API**: Utilize the existing CRUD operations rather than creating new ones
- **Improve Reliability**: Reduce LLM hallucinations when interacting with the database
- **Support Human-in-the-Loop**: Facilitate the confirmation flow for data modifications
- **Enable Extensibility**: Allow easy addition of new capabilities as the application evolves

## MCP Schema Definition

The MCP will define a set of operations that map to existing API endpoints. Each operation will include:
- Operation name and description
- Required and optional parameters with types
- Expected response format
- Example usage
- Error handling

### Core MCP Components

```typescript
/**
 * Kitchen Management MCP Schema
 */
export const KitchenManagementMCP = {
  schema: {
    name: "KitchenManagementMCP",
    description: "Protocol for interacting with the Kitchen Management application",
    version: "1.0.0",
    
    operations: {
      // Inventory Operations
      getInventoryItems: {
        description: "Retrieve inventory items, optionally filtered",
        parameters: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Filter by category",
              required: false
            },
            query: {
              type: "string",
              description: "Search term to filter items by name",
              required: false
            },
            location: {
              type: "string",
              description: "Filter by storage location",
              required: false
            }
          }
        },
        returns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              item_name: { type: "string" },
              category: { type: "string" },
              subcategory: { type: "string" },
              storage_location: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" }
              // Additional properties omitted for brevity
            }
          }
        },
        example: {
          parameters: { category: "dairy" },
          result: [
            { 
              id: 123, 
              item_name: "Milk", 
              category: "dairy", 
              storage_location: "refrigerator", 
              quantity: 1, 
              unit: "gallon" 
            }
          ]
        }
      },
      
      getInventoryItemById: {
        description: "Retrieve a specific inventory item by ID",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID of the inventory item",
              required: true
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            id: { type: "number" },
            item_name: { type: "string" },
            category: { type: "string" },
            subcategory: { type: "string" },
            storage_location: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" }
            // Additional properties omitted for brevity
          }
        }
      },
      
      proposeAddInventoryItem: {
        description: "Propose adding a new item to inventory (requires user confirmation)",
        parameters: {
          type: "object",
          properties: {
            item_name: {
              type: "string",
              description: "Name of the item",
              required: true
            },
            category: {
              type: "string",
              description: "Category of the item",
              required: true
            },
            subcategory: {
              type: "string",
              description: "Subcategory of the item",
              required: false
            },
            storage_location: {
              type: "string",
              description: "Where the item is stored",
              required: true
            },
            quantity: {
              type: "number",
              description: "Amount of the item",
              required: true
            },
            unit: {
              type: "string",
              description: "Unit of measurement",
              required: true
            },
            expiry_date: {
              type: "string",
              description: "When the item expires (ISO date string)",
              required: false
            },
            purchase_date: {
              type: "string",
              description: "When the item was purchased (ISO date string)",
              required: true
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            pendingChangeId: { type: "string" },
            change: {
              type: "object",
              properties: {
                type: { type: "string" },
                itemDetails: { type: "object" }
              }
            }
          }
        }
      },
      
      proposeUpdateInventoryItem: {
        description: "Propose updating an existing inventory item (requires user confirmation)",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID of the item to update",
              required: true
            },
            updates: {
              type: "object",
              description: "Fields to update",
              required: true,
              properties: {
                item_name: { type: "string", required: false },
                category: { type: "string", required: false },
                subcategory: { type: "string", required: false },
                storage_location: { type: "string", required: false },
                quantity: { type: "number", required: false },
                unit: { type: "string", required: false },
                expiry_date: { type: "string", required: false },
                purchase_date: { type: "string", required: false }
              }
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            pendingChangeId: { type: "string" },
            change: {
              type: "object",
              properties: {
                type: { type: "string" },
                id: { type: "number" },
                updates: { type: "object" }
              }
            }
          }
        }
      },
      
      confirmPendingChange: {
        description: "Execute a previously proposed change that has been confirmed by the user",
        parameters: {
          type: "object",
          properties: {
            pendingChangeId: {
              type: "string",
              description: "ID of the pending change to confirm",
              required: true
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            result: { type: "object" }
          }
        }
      },
      
      rejectPendingChange: {
        description: "Reject a previously proposed change",
        parameters: {
          type: "object",
          properties: {
            pendingChangeId: {
              type: "string",
              description: "ID of the pending change to reject",
              required: true
            },
            reason: {
              type: "string",
              description: "Optional reason for rejection",
              required: false
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" }
          }
        }
      },
      
      // Recipe Operations
      getRecipes: {
        description: "Retrieve recipes, optionally filtered",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term to filter recipes by name",
              required: false
            },
            ingredient: {
              type: "string",
              description: "Filter recipes containing this ingredient",
              required: false
            }
          }
        },
        returns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              instructions: { type: "string" },
              cooking_time: { type: "number" },
              difficulty: { type: "string" }
              // Additional properties omitted for brevity
            }
          }
        }
      },
      
      getRecipeById: {
        description: "Retrieve a specific recipe by ID, including ingredients",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID of the recipe",
              required: true
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            instructions: { type: "string" },
            cooking_time: { type: "number" },
            difficulty: { type: "string" },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  recipe_id: { type: "number" },
                  ingredient_name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  is_protein: { type: "boolean" }
                }
              }
            }
          }
        }
      },
      
      checkRecipeAgainstInventory: {
        description: "Check if all ingredients for a recipe are available in inventory",
        parameters: {
          type: "object",
          properties: {
            recipe_id: {
              type: "number",
              description: "ID of the recipe to check",
              required: true
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            canMake: { type: "boolean" },
            missingIngredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ingredient_name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  available: { type: "number" }
                }
              }
            }
          }
        }
      },
      
      // Shopping List Operations
      proposeCreateShoppingList: {
        description: "Propose creating a new shopping list (requires user confirmation)",
        parameters: {
          type: "object",
          properties: {
            items: {
              type: "array",
              description: "Items to add to the shopping list",
              required: true,
              items: {
                type: "object",
                properties: {
                  item_name: { type: "string", required: true },
                  quantity: { type: "number", required: true },
                  unit: { type: "string", required: true },
                  category: { type: "string", required: false }
                }
              }
            },
            fromRecipe: {
              type: "number",
              description: "Recipe ID if creating from recipe",
              required: false
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            pendingChangeId: { type: "string" },
            change: {
              type: "object",
              properties: {
                type: { type: "string" },
                items: { type: "array" }
              }
            }
          }
        }
      },
      
      getShoppingLists: {
        description: "Get all shopping lists",
        parameters: { type: "object", properties: {} },
        returns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              created_at: { type: "string" },
              updated_at: { type: "string" },
              amazon_link: { type: "string" }
            }
          }
        }
      },
      
      getShoppingListById: {
        description: "Get a shopping list by ID with its items",
        parameters: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "ID of the shopping list",
              required: true
            }
          }
        },
        returns: {
          type: "object",
          properties: {
            id: { type: "number" },
            created_at: { type: "string" },
            updated_at: { type: "string" },
            amazon_link: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  shopping_list_id: { type: "number" },
                  item_name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  }
};
```

## Implementation Details

### Integration with Agent

The MCP will be integrated with the Cloudflare Agent through a custom context provider. This will establish the protocol and make it available to the agent for handling user queries.

```typescript
import { Agent } from 'cloudflare:agents';
import { KitchenManagementMCP } from './kitchen-management-mcp';

export class KitchenAgent extends Agent<Env, AgentState> {
  async onMessage(connection, message) {
    // Process the user's message
    const userIntent = await this.interpretUserMessage(message.content);
    
    // For read operations, execute directly
    if (userIntent.operation === 'getInventoryItems' || 
        userIntent.operation === 'getRecipes' ||
        userIntent.operation === 'getShoppingLists') {
      const result = await this.executeOperation(userIntent.operation, userIntent.parameters);
      return connection.send({ type: 'response', content: this.formatResponse(result) });
    }
    
    // For write operations, propose changes for confirmation
    if (userIntent.operation === 'addInventoryItem') {
      const pendingChange = await this.executeOperation('proposeAddInventoryItem', userIntent.parameters);
      return connection.send({ 
        type: 'pendingChange', 
        pendingChangeId: pendingChange.pendingChangeId,
        content: this.formatConfirmationRequest(pendingChange) 
      });
    }
    
    // Similarly for other write operations...
  }
  
  async executeOperation(operation, parameters) {
    // Validate against MCP schema
    this.validateAgainstMCP(operation, parameters);
    
    // Map MCP operation to API endpoint
    const apiEndpoint = this.getApiEndpoint(operation);
    
    // Execute API call
    const response = await fetch(apiEndpoint, {
      method: this.getMethodForOperation(operation),
      headers: { 'Content-Type': 'application/json' },
      body: operation !== 'GET' ? JSON.stringify(parameters) : undefined
    });
    
    return await response.json();
  }
  
  validateAgainstMCP(operation, parameters) {
    const mcpOperation = KitchenManagementMCP.schema.operations[operation];
    if (!mcpOperation) {
      throw new Error(`Unknown operation: ${operation}`);
    }
    
    // Validate parameters against MCP schema
    // Implementation omitted for brevity
  }
  
  // Helper methods
  getApiEndpoint(operation) {
    const endpointMap = {
      'getInventoryItems': '/api/inventory',
      'getInventoryItemById': '/api/inventory/',
      'proposeAddInventoryItem': '/api/inventory/propose',
      // etc.
    };
    return endpointMap[operation];
  }
  
  getMethodForOperation(operation) {
    if (operation.startsWith('get')) return 'GET';
    if (operation.startsWith('propose')) return 'POST';
    if (operation.startsWith('confirm')) return 'POST';
    if (operation.startsWith('reject')) return 'POST';
    return 'POST';
  }
  
  formatResponse(result) {
    // Format API response for user-friendly display
    // Implementation omitted for brevity
  }
  
  formatConfirmationRequest(pendingChange) {
    // Format the pending change into a user-friendly confirmation request
    // Implementation omitted for brevity
  }
}
```

### Human-in-the-Loop Integration

The MCP will directly support the human-in-the-loop confirmation flow by:

1. Providing distinct operations for proposing changes vs. executing them
2. Standardizing the format of pending changes
3. Including operations for confirming or rejecting pending changes

Example flow:

```typescript
// User says: "Add 2 apples to my inventory"

// 1. Agent interprets intent
const intent = {
  operation: 'addInventoryItem',
  parameters: {
    item_name: 'Apple',
    category: 'Produce',
    storage_location: 'Refrigerator',
    quantity: 2,
    unit: 'count',
    purchase_date: new Date().toISOString()
  }
};

// 2. Agent proposes the change via MCP
const pendingChange = await agent.executeOperation('proposeAddInventoryItem', intent.parameters);
// pendingChange = { 
//   pendingChangeId: '1234-5678', 
//   change: { type: 'inventory_add', itemDetails: { /* details */ } } 
// }

// 3. Agent sends confirmation request to user
// "I'll add 2 apples to your inventory. Please confirm."

// 4. User confirms, agent executes the confirmed change
await agent.executeOperation('confirmPendingChange', { pendingChangeId: pendingChange.pendingChangeId });

// 5. Agent informs user of success
// "2 apples have been added to your inventory."
```

## API Extensions

To fully support the MCP and human-in-the-loop flow, the following extensions to your existing API will be required:

### Pending Changes System

Create a new table and API endpoints to manage pending changes:

```sql
CREATE TABLE pending_changes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data JSON NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  expires_at TIMESTAMP DEFAULT (datetime('now', '+1 day')) NOT NULL
);
```

### New API Endpoints

```
POST /api/inventory/propose     - Propose inventory changes
POST /api/shopping-list/propose - Propose shopping list changes
POST /api/changes/confirm       - Confirm a pending change
POST /api/changes/reject        - Reject a pending change
GET  /api/changes/pending       - Get pending changes
```

## MCP to API Mapping

The MCP operations will map to your existing API endpoints as follows:

| MCP Operation | API Endpoint | HTTP Method |
|---------------|--------------|------------|
| getInventoryItems | /api/inventory | GET |
| getInventoryItemById | /api/inventory/:id | GET |
| proposeAddInventoryItem | /api/inventory/propose | POST |
| proposeUpdateInventoryItem | /api/inventory/propose | POST |
| confirmPendingChange | /api/changes/confirm | POST |
| rejectPendingChange | /api/changes/reject | POST |
| getRecipes | /api/recipes | GET |
| getRecipeById | /api/recipes/:id | GET |
| checkRecipeAgainstInventory | /api/recipes/:id/check-inventory | GET |
| proposeCreateShoppingList | /api/shopping-list/propose | POST |
| getShoppingLists | /api/shopping-lists | GET |
| getShoppingListById | /api/shopping-lists/:id | GET |

## Error Handling

The MCP will include standardized error handling:

```typescript
// Error response format
{
  success: false,
  error: {
    code: "VALIDATION_ERROR", // or other error codes
    message: "Invalid parameter: quantity must be a positive number",
    details: {
      field: "quantity",
      constraint: "positive number"
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid parameters
- `NOT_FOUND`: Requested resource not found
- `UNAUTHORIZED`: User not authorized for the operation
- `OPERATION_FAILED`: Operation failed for other reasons
- `PENDING_CHANGE_EXPIRED`: The pending change has expired

## Implementation Plan

### Phase 1: MCP Definition
- Define the complete MCP schema
- Document all operations, parameters, and return types
- Create TypeScript interfaces for type safety

### Phase 2: Pending Changes API
- Create database schema for pending changes
- Implement API endpoints for proposing, confirming, and rejecting changes
- Add expiration handling for pending changes

### Phase 3: Agent Integration
- Implement the MCP in the agent code
- Create validation logic against the MCP schema
- Set up proper error handling and response formatting

### Phase 4: Testing and Refinement
- Create test cases for each MCP operation
- Verify human-in-the-loop flow works correctly
- Refine based on feedback and real-world usage

## Considerations and Tradeoffs

### Performance
- The human-in-the-loop flow adds latency to database modifications
- Caching can be implemented for frequently accessed read operations

### Security
- All proposed changes must be authorized using the same security model as the direct API
- Consider rate limiting for MCP operations

### Usability
- The confirmation flow must be streamlined to avoid frustrating users
- Consider allowing certain trusted operations to bypass confirmation

### Extensibility
- The MCP schema should be versioned to support evolution
- New operations can be added without breaking existing functionality

## Conclusion

Implementing this Model Context Protocol will create a robust interface between the AI agent and your existing API, enabling natural language interaction while preserving data integrity through human confirmation of changes. This approach leverages your existing codebase while adding the necessary structure for reliable AI interactions.