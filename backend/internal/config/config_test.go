package config

import "testing"

func TestPort(t *testing.T) {
	tests := []struct {
		name string
		env  string
		want int
	}{
		{name: "default when unset", want: DefaultPort},
		{name: "explicit port", env: "9000", want: 9000},
		{name: "non-numeric falls back", env: "abc", want: DefaultPort},
		{name: "zero falls back", env: "0", want: DefaultPort},
		{name: "negative falls back", env: "-1", want: DefaultPort},
		{name: "out of range falls back", env: "70000", want: DefaultPort},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// t.Setenv also registers cleanup for the unset case.
			t.Setenv("PORT", tt.env)
			if got := Port(); got != tt.want {
				t.Fatalf("Port() = %d, want %d", got, tt.want)
			}
		})
	}
}

func TestAddr(t *testing.T) {
	t.Setenv("PORT", "1234")
	if got, want := Addr(), ":1234"; got != want {
		t.Fatalf("Addr() = %q, want %q", got, want)
	}
}
