import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchBar from "./search-bar";

vi.mock("swr", () => ({
    default: vi.fn().mockReturnValue({ data: []})
}))

describe("SearchBar", () => {
    it("should not display the admin controls if user is not admin", () => {
        render(<SearchBar
            setSelectedUser={vi.fn()}
            currentPage={1}
            setImageQuery={vi.fn()}
            userIsAdmin={false}
            users={[]}
        ></SearchBar>)

        expect(screen.queryByTestId("admin-controls")).toBeNull()
    })

    it("should display the admin controls if the user is an admin", () => {
        render(<SearchBar
            setSelectedUser={vi.fn()}
            currentPage={1}
            setImageQuery={vi.fn()}
            userIsAdmin={true}
            users={[]}
        ></SearchBar>)

        expect(screen.getByTestId("admin-controls")).toBeDefined()
    })
})