from app.tools.search_web import search_web


print("=" * 80)
print("TravelPilot Tavily Tool Test")
print("=" * 80)

query = "Louvre Museum Paris official opening hours October 2026"

print(f"\nQuery: {query}")

response = search_web(
    query=query,
    max_results=5,
)

print(f"Results: {response['result_count']}")
print("=" * 80)

for index, result in enumerate(response["results"], start=1):
    print(f"\nRESULT {index}")
    print(f"Title : {result['title']}")
    print(f"URL   : {result['url']}")
    print(f"Score : {result['score']}")
    print(
        f"Content: "
        f"{result['content'][:350] if result['content'] else ''}"
    )
    print("-" * 80)

print("\nTavily tool test PASSED.")
