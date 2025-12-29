import asyncio
from fastmcp import Client

client = Client("stdio_server.py")

async def call_tool(name: str):
    async with client:
        result = await client.call_tool("hello_world", {"name": name})
        print(result)

asyncio.run(call_tool("Ford"))
