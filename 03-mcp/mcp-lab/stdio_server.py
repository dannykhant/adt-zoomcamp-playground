from fastmcp import FastMCP

mcp = FastMCP("My MCP Server")


@mcp.tool
async def hello_world(name: str) -> str:
    """A simple hello world resource."""
    return f"Hello, {name}!"


@mcp.tool
async def get_current_time() -> str:
    """Get the current server time."""
    from datetime import datetime
    return datetime.now().isoformat()


if __name__ == "__main__":
    mcp.run()
